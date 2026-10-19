const supabaseUrl = process.env.URL; // Replace with real URL
const supabaseAnonKey = process.env.ANON_KEY; // Replace with real Key

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

window.supabaseClient = supabaseClient;

console.log("Supabase ініціалізовано успішно!");