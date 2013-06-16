# nf

If you've used perl oneliners before you're expecting when you pass `-pe` to
node that you'll evaluate the script once per input line


```
$ echo -e "foo\nbar" | perl -pe '"baz"'
foo
bar
```

However if you try it:

```
$ echo -e "foo\nbar" | node -pe '"baz"'
baz
```

`nf` is a small package that lets you perform arbitrary javascript/node actions
once per input line:

```
$ npm install -g nf
$ echo -e "foo\nbar" | nf -pe '"baz"'
baz
baz
```

Valid command line arguments:

 * `-e` -- evaluate the given script (if not passed assumes last argument is
a javascript file to load)
 * `-n` -- evaluate the given script once per input line, the current line is
available in the global `__line`
 * `-p` -- evaluate the given script once per input line with an implicit print
of the return value (implies `-n`)

Here's a small example interpreting the current line

```
$ echo -e "foo\nbaz\nfoobar" | nf -pe '__line.replace(/foo/, "bar")'
bar
baz
barbar
```

Here is `apache.js` which transforms an apache log line to json:

```
var pattern = /^(\S+)\s+(\S+)\s+(\S+)\s+\[(.+)\]\s+(.+)\s+(.+)\s+(HTTP\/\d+.\d+)\s+"(\d+)"\s+(\S+)\s+"(.*)"\s+"(.*)"\s+"(.*)"$/;

(function(line) {
  var m = line.match(pattern);

  if (!m) return JSON.stringify({});

  var obj = {
    host: m[1],
    a: m[2],
    user: m[3],
    date: m[4],
    method: m[5],
    url: m[6],
    version: m[7],
    statusCode: m[8],
    contentLength: m[9],
    refer: m[10],
    userAgent: m[11],
  };

  return JSON.stringify(obj);
})(__line);
```

then using [jsontool](http://npmjs.org/package/jsontool) you can find the `uniq` userAgents


```
tail -100 access.log | nf -p ./apache.js | json -ga userAgent | sort -r | uniq
zzReader/1.0 (http://zzreader.com)
curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8x zlib/1.2.5
curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5
curl/7.21.0 (x86_64-pc-linux-gnu) libcurl/7.21.0 OpenSSL/0.9.8o zlib/1.2.3.4 libidn/1.15 libssh2/1.2.6
curl/7.19.7 (x86_64-redhat-linux-gnu) libcurl/7.19.7 NSS/3.13.1.0 zlib/1.2.3 libidn/1.18 libssh2/1.2.2
curl/7.19.7 (x86_64-pc-linux-gnu) libcurl/7.19.7 OpenSSL/0.9.8k zlib/1.2.3.3 libidn/1.15
Tiny Tiny RSS/1.7.9.de32b48 (http://tt-rss.org/)
Tiny Tiny RSS/1.5.7 (http://tt-rss.org/)
Superfeedr bot/2.0 http://superfeedr.com - Please get in touch if we are polling too hard.
Opera/9.80 (Android; Opera Mini/14.0.1074/29.3551; U; en) Presto/2.8.119 Version/11.10
NewsBlur Page Fetcher (239 subscribers) - http://www.newsblur.com (Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_1) AppleWebKit/534.48.3 (KHTML, like Gecko) Version/5.1 Safari/534.48.3)
NewsBlur Feed Fetcher - 239 subscribers - http://www.newsblur.com (Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/536.2.3 (KHTML, like Gecko) Version/5.2)
Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:21.0) Gecko/20100101 Firefox/21.0
Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0
Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36
Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31
Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/536.30.1 (KHTML, like Gecko) Version/6.0.5 Safari/536.30.1
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.37 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36
Mozilla/4.0 (compatible;)
Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; GTB7.4; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)
Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)
Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022)
HTTP_Request2/2.1.1 (http://pear.php.net/package/http_request2) PHP/5.4.8
Fever/1.31 (Feed Parser; http://feedafever.com; Allow like Gecko)
FeedHQ/0.1.262 (https://github.com/feedhq/feedhq; 4 subscribers; https://github.com/feedhq/feedhq/wiki/User-Agent)
CommaFeed/1.0 (http://www.commafeed.com)
```
