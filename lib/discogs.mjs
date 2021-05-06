import axios from 'axios';

export class Discogs {
  urlBase = 'https://api.discogs.com/';

  constructor(token) {
    this.token = token;
    this.wait = false;
  }
  
  async canProgress() {
    if (!this.wait) return;
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (!this.wait) {
          clearInterval(timer);
          resolve();
        }
      }, 10)
    })
  }

  async rateLimit({ 'x-discogs-ratelimit': quota, 'x-discogs-ratelimit-remaining': remaining }) {
    console.log(`Remaining discogs quota ${remaining} / ${quota}`)
    const backoff = quota / 60 * 1000;
    console.log(`Backing off for ${backoff}`);
    this.wait = true;
    setTimeout(() => this.wait = false, parseInt(backoff));
  }

  async request(url) {
    console.time('Wait');
    await this.canProgress();
    console.timeEnd('Wait');
    const result = await axios({
      url,
      headers: {
        Authorization: `Discogs token=${this.token}`
      }
    });
    this.rateLimit(result.headers);
    return result.data;
  }

  async search(artist, title) {
    const url = new URL('/database/search', this.urlBase);
    const q = url.searchParams;
    q.append('type', 'master');
    q.append('artist', artist);
    q.append('release_title', title);
    return this.request(url.toString());
  }
}