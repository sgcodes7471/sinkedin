import { createClient } from '@lib/supabase/server'

export default async function DeletePosts(params) {
  try {
    const supabase = await createClient()

    const { idsArray } = params

    const { error } = await supabase.from('posts').delete().in('id', idsArray)

    if (error) throw error
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
