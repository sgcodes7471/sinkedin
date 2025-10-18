import Queuing from './batchPosts.js'
import TokenizePosts from './tokenizePosts.js'

async function ContentModerationCheck(post) {
  // call tokenizePosts()
  const { id, text } = post
  const tokens = TokenizePosts(text)

  // send to Queuing()
  // returns nothing
  const postObject = {
    id: id,
    tokens: tokens,
  }
  Queuing(postObject)
}

export default ContentModerationCheck
