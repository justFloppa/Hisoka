import b4a from 'b4a'
import DHT from 'hyperdht' 
import process from 'bare-process'

export async function runServer(dht) {
    const keyPair = DHT.keyPair() //public и private ключи создание

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