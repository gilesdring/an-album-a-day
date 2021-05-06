import axios from 'axios';

export class GoogleSheets {
  constructor(sheet) {
    this.sheet = sheet;
  }
  async getStream() {
    const data = await axios({
      url: this.sheet,
      responseType: 'stream'
    }).then(res => res.data);
    return data;
  }
}