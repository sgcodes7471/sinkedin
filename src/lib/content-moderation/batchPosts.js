import DeletePosts from './deletePost'
import LLMConnect from './llmConnect'

export default async function Queuing(posts) {
  let queue = []
  let temp = []
  let processing = false

  function transferFromTempToQueue() {
    if (temp.length > 0) {
      queue.push(...temp)
      temp = []
    }
  }

  async function processQueue() {
    if (processing || queue.length < 10) return
    processing = true

    const batch = queue.splice(0, 10)

    let res = await LLMConnect(batch)
    while (!res || res.error) {
      await new Promise((r) => setTimeout(r, 2000)) // retry after 2s
      res = await LLMConnect(batch)
    }

    processing = false

    if (res.error) {
      return { success: false, error: 'Something went wrong in the LLM Check' } // something went wrong
    }

    if (res.idsArray.length == 0) {
      queue = []
      transferFromTempToQueue()
      return { success: true, message: 'No Posts needs to be removed' } // no posts needed to be removed
    }

    const del_response = await DeletePosts({ idsArray: res.idsArray })
    if (del_response) {
      queue = []
      transferFromTempToQueue()
      return { success: true, error: 'Abusive Posts deleted' }
    } else {
      queue = []
      transferFromTempToQueue()
      return { success: false, error: 'Some Error occured in ' }
    }
  }

  return new Promise(async (resolve) => {
    queue.push(posts)

    const interval = setInterval(async () => {
      if (queue.length >= 10 && !processing) {
        const res = await processQueue()
        if (res) {
          clearInterval(interval)
          resolve(res)
        }
      }
    }, 200)

    // capture new tokens while batch is processing
    const addPosts = (newPosts) => {
      if (processing) temp.push(newPosts)
      else queue.push(newPosts)
    }

    // Expose adder so caller can push more
    resolve({ addPosts })
  })
}
