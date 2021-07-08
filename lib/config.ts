import "https://deno.land/x/dotenv/load.ts";

export default {
  discogs: {
    token: Deno.env.get('DISCOGS_TOKEN')
  }
}