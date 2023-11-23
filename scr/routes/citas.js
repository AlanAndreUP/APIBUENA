const express = require('express');
const router = express.Router();
const Citas = require('../models/citaSchema');


router.get('/', async (req, res) => {
  try {
    const items = await Citas.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:_id', async (req, res) => {
  const itemId = req.params.idUser;
  
  try {
    const item = await Citas.findOne({ _id: itemId });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Objeto no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const newItemData = req.body;

  try {
    const newItem = new Citas(newItemData);
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

router.put('/:_id', async (req, res) => {
  const itemId = req.params.email;
  const updatedItemData = req.body;

  try {
    const result = await Citas.findOneAndUpdate({ email: itemId }, updatedItemData, { new: true });

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Objeto no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:_id', async (req, res) => {
  const itemId = req.params.email;

  try {
    const result = await Citas.findOneAndRemove({ email: itemId });

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