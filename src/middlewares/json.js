export async function json(req, res) {

  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  
  try {
    const body = JSON.parse(Buffer.concat(buffers).toString())
    req.body = body
 } catch (error) {
    req.body = null
 }

 res.setHeader('Content-type', 'application/json')
}