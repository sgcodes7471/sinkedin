// ---- RULES ----
// runs immediately after a posts, and the checks by abusive score
// if abusive score above 0.75 then delete directly/not posted
// if abusive score between 0.25 and 0.75 then put in the llm-check(or batch queue if possible)
// if below 0.25 then skip

// calculating the abusive score :
// fist clean/normalize the posts and convert to tokens array - DONE
// keep a track of words, and if these words are found then the abusive score = 1, delete/not post at all
//

// here keep two functions
// first one calculates the score and decides whether to post, check in llm or prevent
// this returns the score to the caller function if llm-check is needed
// next function is for the batch queueing and llm check, which can direct to a the delete post function
