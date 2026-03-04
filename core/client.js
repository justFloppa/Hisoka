import b4a from 'b4a'
import process from 'bare-process'

export async function runClient(key, dht) {
    
    console.log('Connecting to:', key) //подключаемся по ключу
    const publicKey = b4a.from(key, 'hex') //конверт ключа в бин
    
    const conn = dht.connect(publicKey) //создаем соединение используя таблицу и наш ключ
    conn.once('open', () => console.log('подключено')) //подключаемся
    
    process.stdin.pipe(conn).pipe(process.stdout) //выводим сообщения собеседника и наши
}