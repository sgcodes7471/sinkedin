import DeletePosts from '@/lib/deletePost'
import LLMConnect from '@/lib/llmConnect'

let queue = []
let temp = []
let processing = false
let started = false

function transferFromTempToQueue() {
  if (temp.length > 0) {
    queue.push(...temp)
    temp = []
  }
}

async function processQueue() {
  if (processing || queue.length < 10) return
  processing = true

  const batch = queue
  let res = await LLMConnect(batch)

  while (!res || res.error) {
    await new Promise((r) => setTimeout(r, 2000))
    res = await LLMConnect(batch)
  }

  processing = false

  if (res.error) return

  if (res.idsArray.length === 0) {
    queue = []
    transferFromTempToQueue()
    return
  }

  const delResponse = await DeletePosts({ idsArray: res.idsArray })
  if (delResponse) {
    queue = []
  }
  transferFromTempToQueue()
}

function startQueueProcessor() {
  if (started) return // this prevents this from running multiple times , kind of acting similar to useRef()
  started = true
  setInterval(async () => {
    if (queue.length >= 10 && !processing) {
      await processQueue()
    }
  }, 1000)
}

export function initQueue() {
  startQueueProcessor()

  const addToQueue = (post) => {
    if (processing) temp.push(post)
    else queue.push(post)
  }

  return { addToQueue }
}
