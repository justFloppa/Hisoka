import b4a from 'b4a'
import DHT from 'hyperdht' 
import process from 'bare-process'
import { returnSession, saveSession } from '../utilities/saveSession.js'

export async function runServer(dht) {
    let keyPair
    try {
        keyPair = await (await returnSession()).keyPair
    }
    catch {
        keyPair = DHT.keyPair()
        saveSession(b4a.toString(keyPair.publicKey, 'hex'), b4a.toString(keyPair.secretKey, 'hex'))
    }


    const server = dht.createServer(conn => { //сервер создание
    console.log('к вам подключились')

    process.stdin.pipe(conn).pipe(process.stdout) //отображение своих и чужих соо
    })

    server.listen(keyPair).then(() => { //сервер слушает
    console.log('сервер запущен\npublic key:', b4a.toString(keyPair.publicKey, 'hex')) //наш ключ
    console.log("введите ключ или ждите подключения по вашему: ")
})

    Pear.teardown(() => server.close())
}