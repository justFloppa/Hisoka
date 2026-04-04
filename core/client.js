import b4a from 'b4a'
import process from 'bare-process'

export async function runClient(key, dht) {
    
    console.log('Connecting to:', key) //подключаемся по ключу
    const publicKey = b4a.from(key, 'hex') //конверт ключа в бин
    
    const conn = dht.connect(publicKey) //создаем соединение используя таблицу и наш ключ
    conn.once('open', () => console.log('подключено')) //подключаемся
    
    // process.stdin.pipe(conn).pipe(process.stdout) //выводим сообщения собеседника и наши
    
    conn.on('data', (data) => {
        const message = JSON.parse(data.toString())
        message.from = key
        process.stdout.write(JSON.stringify({ event: 'message', data: message }) + '\n')
    })
    
    process.stdin.on('data', (input) => {
        const message = {
            text: input.toString().trim(),
            timestamp: Date.now()
        }
        conn.write(JSON.stringify(message))
    })
}