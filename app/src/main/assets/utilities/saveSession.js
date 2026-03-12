import fs from 'bare-fs'
import b4a from 'b4a'


export async function saveSession(publickey, privatekey) {
  const data = {
    "public": String(publickey),
    "private": String(privatekey)
  }

  await fs.writeFile(
    './data/session.json',
    JSON.stringify(data, null, 2),
    'utf-8'
  )
}

export async function returnSession() {
    const data = await fs.promises.readFile("./data/session.json", 'utf8')
    const session = JSON.parse(data)
    
    const keyPair = {
        publicKey: b4a.from(session.public, 'hex'),
        secretKey: b4a.from(session.private, 'hex')
    }
    return { keyPair }
}