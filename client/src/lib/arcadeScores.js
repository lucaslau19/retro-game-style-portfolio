import { supabase } from './supabase'

// Fetch top 10 scores globally
export async function getTopScores() {
  if (!supabase) {
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('arcade_scores')
      .select('initials, score, created_at')
      .order('score', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Failed to fetch scores:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('Error fetching scores:', err)
    return []
  }
}

// Submit a new score
export async function submitScore(initials, score) {
  if (!supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from('arcade_scores')
      .insert([{ initials: initials.toUpperCase(), score }])
    
    if (error) {
      console.error('Failed to submit score:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error submitting score:', err)
    return false
  }
}
