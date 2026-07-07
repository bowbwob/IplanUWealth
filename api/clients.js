const { kv } = require('@vercel/kv');

const HASH_KEY = 'fp_clients';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const clients = (await kv.hgetall(HASH_KEY)) || {};
      res.status(200).json({ ok: true, clients });
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, data } = body || {};
      if (!id || !data) {
        res.status(400).json({ ok: false, error: 'ต้องมี id และ data' });
        return;
      }
      data._savedAt = new Date().toISOString();
      await kv.hset(HASH_KEY, { [id]: data });
      res.status(200).json({ ok: true, id });
      return;
    }

    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id) || (new URL(req.url, 'http://x').searchParams.get('id'));
      if (!id) {
        res.status(400).json({ ok: false, error: 'ต้องระบุ id' });
        return;
      }
      await kv.hdel(HASH_KEY, id);
      res.status(200).json({ ok: true, id });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
};
