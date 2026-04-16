import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Upload image et retourne l'URL publique
export async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('produits-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: urlData } = supabase.storage.from('produits-images').getPublicUrl(fileName)
  return urlData.publicUrl
}
