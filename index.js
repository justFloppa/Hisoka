import DHT from 'hyperdht'
import b4a from 'b4a'
import process from 'bare-process'
import readline from 'bare-readline' 


function readInput(prompt, callback) {
  console.log(prompt)
  process.stdin.once('data', (data) => {
    const input = data.toString().trim()
    callback(input)
  })
}

const dht = new DHT() //хэш таблица

//сервер
async function runServer() {
    const server = dht.createServer(conn => { //сервер создание
    console.log('server started')
    process.stdin.pipe(conn).pipe(process.stdout) //отображение своих и чужих соо
    })

    const keyPair = DHT.keyPair() //public и private ключи создание
    server.listen(keyPair).then(() => { //сервер слушает
    console.log('public key: ', b4a.toString(keyPair.publicKey, 'hex')) //наш ключ
})

    Pear.teardown(() => server.close())
}

async function runClient() {
    console.log("введите публичный ключ: ")
    const input = await new Promise(resolve => {
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim())
            })
        })
    let key = input


    //const key = Pear.config.args[0] //берет ключ собеседника
    //if (!key) throw new Error('provide a key') //просит ключ
    
    console.log('Connecting to:', key) //подключаемся по ключу
    const publicKey = b4a.from(key, 'hex') //конверт ключа в бин
    
    const conn = dht.connect(publicKey) //создаем соединение используя таблицу и наш ключ
    conn.once('open', () => console.log('got connection!')) //подключаемся
    
    process.stdin.pipe(conn).pipe(process.stdout) //выводим сообщения собеседника и наши
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log("1-сервер\n2-клиент")


readInput('\nВыберите режим: ', (choice) => {
  switch(choice) {
    case '1':
      runServer()
      break
    case '2':
      runClient()
      break
    default:
      console.log('попробуйте еще раз')
      process.exit(1)
  }
})

Pear.teardown(() => {
  dht.destroy()
})

