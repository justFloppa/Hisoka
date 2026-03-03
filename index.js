import DHT from 'hyperdht'
import b4a from 'b4a'
import process from 'bare-process'
import readline from 'bare-readline' 

const dht = new DHT() //хэш таблица

//сервер
async function runServer() {
    const keyPair = DHT.keyPair() //public и private ключи создание

    const server = dht.createServer(conn => { //сервер создание
    console.log('к вам подключились')
    process.stdin.pipe(conn).pipe(process.stdout) //отображение своих и чужих соо
    })

    server.listen(keyPair).then(() => { //сервер слушает
    console.log('сервер запущен\npublic key: ', b4a.toString(keyPair.publicKey, 'hex')) //наш ключ
    console.log("введите ключ или ждите подключения по вашему: ")
})

    Pear.teardown(() => server.close())
}

async function runClient(key) {
    
    console.log('Connecting to:', key) //подключаемся по ключу
    const publicKey = b4a.from(key, 'hex') //конверт ключа в бин
    
    const conn = dht.connect(publicKey) //создаем соединение используя таблицу и наш ключ
    conn.once('open', () => console.log('подключено')) //подключаемся
    
    process.stdin.pipe(conn).pipe(process.stdout) //выводим сообщения собеседника и наши
}

async function main() {
  const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
  })

  await runServer()

  rl.on('data', (line) => {
  if (line.startsWith('/')) {
    runClient(line.slice(1))
  }
  })
}

main()

Pear.teardown(() => {
  dht.destroy()
})
