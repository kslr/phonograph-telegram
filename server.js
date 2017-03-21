/**
 * Created by kslr on 17/3/16.
 */
const Telegram = require('node-telegram-bot-api');
const Music = require('music-api');
const request = require('request');


const TOKEN = process.env.TELEGRAM_TOKEN || '';
const bot = new Telegram(TOKEN, { polling: true });


bot.getMe().then((me) => {
  console.log('Hello! My name is %s!', me.first_name);
  console.log('My id is %s.', me.id);
  console.log('And my username is @%s.', me.username);
});


bot.onText(/\/play (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const keyword = match[1];
  if (keyword.length === 0) {
    bot.sendMessage(chatId, 'no song name');
    return;
  }

  Music.searchSong('netease', {
    key: keyword,
    limit: 1,
    page: 1,
  }).then((searchResult) => {
    const songMeta = searchResult.songList[0];
    const songId = songMeta.id;
    console.info(songMeta);

    Music.getSong('netease', {
      id: `${songId}`,
    }).then((songResult) => {
      console.info(songResult);
      const audio = request(songResult.url);
      bot.sendAudio(msg.chat.id, audio, {
        title: songMeta.name,
        performer: songMeta.artists[0].name,
      });
    });
  })
    .catch(err => console.error(err));
});


bot.on('polling_error', (error) => {
  console.error(error.code);
});
