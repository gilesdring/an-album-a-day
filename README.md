


/database/search?q={query}&{?type,title,release_title,credit,artist,anv,label,genre,style,country,year,format,catno,barcode,track,submitter,contributor}

curl "https://api.discogs.com/database/search?q=Nirvana" -H "Authorization: Discogs key=foo123, secret=bar456"

curl "https://api.discogs.com/database/search?q=Nirvana" -H "Authorization: Discogs token=${DISCOGS_TOKEN}"