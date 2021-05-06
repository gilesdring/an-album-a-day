import { Discogs } from './lib/discogs.mjs';
import { GoogleSheets } from './lib/sheets.mjs';
import parse from 'csv-parse';
import { writeFile } from 'fs';
import './lib/config.mjs'

const discogs = new Discogs(process.env.DISCOGS_TOKEN);
const source = new GoogleSheets(process.env.SOURCE_CSV);

const augment = ({ artist, album }) => discogs.search(artist, album)
  .then(data => data.results[0])
  .then((data) => (data ? { year: data.year, discogs_id: data.id, cover_image: data.cover_image, discogs_title: data.title } : undefined))
  ;

const rateLimit = async () => new Promise((resolve) => setTimeout(resolve, 10));

(async () => {
  const records = [];
  const parser = (await source.getStream()).pipe(parse({
    columns: true,
    cast: function(value, context){
      if (context.header) {
        return value.toLowerCase().replace(/[^a-z]+/g, '_').replace(/(^_|_$)/g, '');
      }
      if (context.column === 'date') {
        return new Date(value);
      }
      if (context.column === 'new_to_me')
        return value === 'TRUE';
      return value;
    },
  }))

  for await (const record of parser) {
    if (record.artist && record.album) {
      console.log(`Processing ${record.album} by ${record.artist}...`)
      const discogsInfo = await augment(record)
        .catch(error => {
          console.error(error.message);
          return {};
        });
      records.push({ ...record, ...discogsInfo });
    }
  }
  await new Promise(resolve => writeFile('data/aaad.json', JSON.stringify(records, null, 2), resolve));
  console.log('Done...');
})();
