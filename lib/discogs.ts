export class Discogs {
  private urlBase = 'https://api.discogs.com/';
  private token: string;
  private wait: boolean;

  constructor(token: string | undefined) {
    if (token === undefined) throw new Error('Provide a token');
    this.token = token;
    this.wait = false;
  }
  
  async canProgress(): Promise<void> {
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

  async rateLimit(headers: any) {
    const quota = parseInt(headers.get('x-discogs-ratelimit'));
    const remaining = parseInt(headers.get('x-discogs-ratelimit-remaining'));
    console.log(`Remaining discogs quota ${remaining} / ${quota}`)
    const backoff = quota / 60 * 1000;
    console.log(`Backing off for ${backoff}`);
    this.wait = true;
    setTimeout(() => this.wait = false, backoff);
  }

  async request(url: string) {
    console.time('Wait');
    await this.canProgress();
    console.timeEnd('Wait');
    const result = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${this.token}`
      }
    });
    this.rateLimit(result.headers);
    return result.json();
  }

  async search(artist: string, title: string) {
    const url = new URL('/database/search', this.urlBase);
    const q = url.searchParams;
    q.append('type', 'master');
    q.append('artist', artist);
    q.append('release_title', title);
    return this.request(url.toString());
  }
}