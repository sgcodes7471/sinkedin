import LLMConnect from './llmConnect'

export default async function Queuing(posts) {
  let queue = []
  let temp = []
  let processing = false

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

    // move any tokens added during processing
    if (temp.length > 0) {
      queue.push(...temp)
      temp = []
    }

    return res
  }

  return new Promise(async (resolve) => {
    queue.push(posts)

    // monitor queue additions dynamically
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
    const addTokens = (newPosts) => {
      if (processing) temp.push(newPosts)
      else queue.push(newPosts)
    }

    // Expose adder so caller can push more
    resolve({ addTokens })
  })
}
