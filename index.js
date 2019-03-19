'use strict';
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

console.log("LOADING LIBRARIES...");

const Discord = require("discord.js");
const client = new Discord.Client();

client.login("<DISCORD_TOKEN>").catch(console.error);

function updateStatus() {
	client.user.setActivity(client.voiceConnections.size + " connection" + (client.voiceConnections.size === 1 ? "" : "s")).catch(console.error);
}

client.on("ready", function() {
	updateStatus();
	console.log("READY FOR ACTION!");
});

const dictionaries = [['霊玉', 'れいたま'], ['ｒｉｃｈａ*', 'りっちゃん']];
let ebicount = 0
client.on("message", function(message) {
	if (message.author.bot || !message.guild) return;
	const content = message.content.toLowerCase();
	if (content === "/join" || content === "代わりに喋って" || content === "かわりに喋って" || content === "代わりにしゃべって" || content === "かわりにしゃべって") {
		if (message.member.voiceChannel) {
			message.member.voiceChannel.join().then(function() {
				updateStatus();
				message.channel.send("よかろう。代わりに喋ってあげよう。").catch(console.error);
			}).catch(function() {
				message.channel.send("先にボイスチャンネルに接続してください").catch(console.error);
			});
		} else {
			message.channel.send("先にボイスチャンネルに接続してください").catch(console.error);
		}
	} else if (content === "/leave" || content.match(/喋らなくてもいいよ/) || content.match(/しゃべらなくていいよ/)) {
		const connection = message.guild.voiceConnection;
		if (connection) {
			connection.disconnect();
			updateStatus();
			message.channel.send("お疲れ様でした。お先に失礼します。").catch(console.error);
		}
	} else if (content.match(/えびさんだまれ/) || content.match(/えびさんはだまれ/) || content.match(/えびぃさんだまれ/) || content.match(/えびぃさんはだまれ/)) {
		ebicount = 1 + Math.floor( Math.random() * 12 )
	} else if (content) {
		if (ebicount > 0 && message.author.username === "えびぃ") {
			if (content.match(/ごめん/)) {
				message.channel.send("次から気をつけろよ").catch(console.error);
				ebicount = 0;
				return
			} else {
				message.channel.send("えびぃさんは黙れ").catch(console.error);
				ebicount = ebicount - 1;
				return 
			}
		}
		const connection = message.guild.voiceConnection;
		if (connection) {
			console.log("Playing " + content + "!");
			var text = message.content
			if (text.slice(-3) === 'www' || text.slice(-3) === 'ｗｗｗ') {
				text = text.slice(0, -3) + 'ワラワラワラ'
			} else if (text.slice(-2) === 'ww' || text.slice(-2) === 'ｗｗ') {
				text = text.slice(0, -2) + 'ワラワラ'
			} else if (text.slice(-1) === 'w' || text.slice(-1) === 'ｗ') {
				text = text.slice(0, -1) + 'ワラ'
			}
			if (message.member.nickname) {
				text = message.member.nickname + "__" + text
			} else {
				text = message.author.username + "__" + text
			}
			for (var dic of dictionaries) {
				text = text.replace(new RegExp(dic[0], 'g'), dic[1])
			}
      speak(connection, text)
		}
	}
});

function speak(connection, content) {
  // Creates a client
  const client = new textToSpeech.TextToSpeechClient();

  // The text to synthesize
  const text = content;

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML Voice Gender (optional)
    voice: {languageCode: 'ja-JP', ssmlGender: 'NEUTRAL'},
    // Select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the Text-to-Speech request
  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.log(err)
      return;
		}
		
		const fileName =  './' + connection.channel.id + '.mp3'
		fs.writeFileSync(fileName, response.audioContent, 'binary');
		connection.playFile(fileName)
		// const Readable = require('stream').Readable;
		// const s = new Readable();
		// s._read = () => {}; // redundant? see update below
		// s.push(response.audioContent);
		// s.push(null);
		// connection.playStream(s)
		// s.destroy
  })
}