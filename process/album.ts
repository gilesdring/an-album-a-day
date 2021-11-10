import { readCSV, writeJSON } from 'https://deno.land/x/flat/mod.ts';
import config from '../lib/config.ts';
import { Discogs } from '../lib/discogs.ts';

const discogs = new Discogs(config.discogs.token);

const filename = Deno.args[0];

type albumType = {
  artist: string;
  album: string;
}

const dropUndefined = (album: any) => Boolean(album.Artist);

const parseAlbum = (album: any) => ({
  date: new Date(album.Date),
  artist: album.Artist,
  album: album.Album,
  new_to_me: album["New to me?"] === 'TRUE',
  comments: album.Comments,
})

const albumsList = (await readCSV(filename)).filter(dropUndefined).map(parseAlbum);

const getDiscogsData = async ({ artist, album }: albumType) => await discogs.search(artist, album)
  .then((response: any) => response.results[0])
  .then((data: any) => (data ? { year: data.year, discogs_id: data.id, cover_image: data.cover_image, discogs_title: data.title } : undefined))
  .catch(error => {
    console.error(error.message);
    return {};
  });

const dayString = (date: Date) => date.toISOString().split('T')[0];

await writeJSON(`data/aaad.json`, albumsList.map(d => ({ id: dayString(d.date), ...d })));

for (const album of albumsList.filter(dropUndefined).map(parseAlbum)) {
  const discogsInfo = await getDiscogsData(album);
  const albumData = {
    ...album,
    ...discogsInfo,
  }
  console.log(albumData);
  await writeJSON(`data/${dayString(album.date)}.json`, albumData);
}