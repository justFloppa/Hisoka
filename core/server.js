import b4a from 'b4a'
import DHT from 'hyperdht' 
import process from 'bare-process'
import { returnSession, saveSession } from '../utilities/saveSession.js'

export async function runServer(dht) {
//     let keyPair
//     try {
//         keyPair = await (await returnSession()).keyPair
//     }
//     catch {
    let keyPair = DHT.keyPair()
// saveSession(b4a.toString(keyPair.publicKey, 'hex'), b4a.toString(keyPair.secretKey, 'hex'))
//     }


    const server = dht.createServer(conn => { //сервер создание
    console.log('к вам подключились')

    const peerPublicKey = conn.remotePublicKey ? b4a.toString(conn.remotePublicKey, 'hex') : 'unknown' //получение ключа подключившегося

    conn.on('data', (data) => { //при получении сообщения
        try {
            let message = JSON.parse(data.toString())
            
            message.from = peerPublicKey //инфо о отправиьеле
            message.timestamp = message.timestamp || Date.now()
            
            process.stdout.write(JSON.stringify({ 
                event: 'message', 
                data: message 
            }) + '\n')
        } catch (e) {
            console.log("JS: error: ", e)
            process.stdout.write(JSON.stringify({ 
                event: 'message', 
                data: {
                    text: data.toString(),
                    from: peerPublicKey,
                    timestamp: Date.now()
                }
            }) + '\n')
        }
    })

    conn.on('close', () => {
        console.log('пир отключился')
    })
})
    server.listen(keyPair).then(() => { //сервер слушает
        console.log('сервер запущен\npublic key:', b4a.toString(keyPair.publicKey, 'hex')) //наш ключ
        console.log("введите ключ или ждите подключения по вашему: ")
})

    Pear.teardown(() => server.close())
}