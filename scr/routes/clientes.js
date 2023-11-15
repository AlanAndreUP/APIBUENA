const express = require('express');
const router = express.Router();
const publicaciones = require('../models/PublicacionModel.js');

router.post('/', async (req, res) => {
  const newItemData = req.body;

  try {
    const newItem = new publicaciones(newItemData);
    const result = await newItem.save();

    if (result) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ error: 'Error en la inserción de datos' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const items = await publicaciones.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const item = await publicaciones.findOne({ IDCliente: itemId });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Objeto no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  const itemId = req.params.id;
  const updatedItemData = req.body;

  try {
    const result = await publicaciones.findOneAndUpdate({ IDCliente: itemId }, updatedItemData, { new: true });

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Objeto no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const result = await publicaciones.findOneAndRemove({ IDCliente: itemId });

    if (result) {
      res.json({ message: 'El objeto fue eliminado' });
    } else {
      res.status(404).json({ error: 'Objeto no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
