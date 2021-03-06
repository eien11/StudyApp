const ErrorResponse = require('../utils/errorResponse');
const Vocabulary = require('../models/Vocabulary');
const Deck = require('../models/Deck');

// @desc    Get all available vocabulary
// @url     GET /api/v1/vocabulary/
// @url     GET /api/v1/decks/:decksId/vocabulary
// @access  private
exports.getVocabulary = async (req, res, next) => {
  try {
    let query;

    if (req.params.deckId) {
      query = Vocabulary.find({ deck: req.params.deckId, user: req.user.id }).populate(
        {
          path: 'deck',
          select: 'name',
        },
      );
    } else {
      query = Vocabulary.find({ user: req.user.id }).populate({
        path: 'deck',
        select: 'name',
      });
    }

    const vocabulary = await query;

    res.status(200).json({
      success: true,
      count: vocabulary.length,
      data: vocabulary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get vocabulary for review
// @url     GET /api/v1/decks/:decksId/vocabulary/review
// @access  private
exports.getReviews = async (req, res, next) => {
  try {
    const query = Vocabulary.find({
      deck: req.params.deckId,
      user: req.user.id,
      reviewDate: { $lte: Date.now() },
    });

    const vocabulary = await query;

    const randomIndex = Math.floor(Math.random() * vocabulary.length);

    res.status(200).json({
      success: true,
      count: vocabulary.length,
      data: vocabulary[randomIndex],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single vocabulary
// @url     GET /api/v1/vocabulary/:id
// @access  private
exports.getSingleVocabulary = async (req, res, next) => {
  try {
    const vocabulary = await Vocabulary.find({ _id: req.params.id, user: req.user.id }).populate({
      path: 'deck',
      select: 'name',
    });

    if (vocabulary.length === 0) {
      return next(new ErrorResponse(`Vocabulary with id ${req.params.id} was not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: vocabulary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add single vocabulary
// @url     POST /api/v1/decks/:deckId/vocabulary/
// @access  private
exports.addVocabulary = async (req, res, next) => {
  try {
    req.body.deck = req.params.deckId;

    req.body.user = req.user.id;

    const deck = await Deck.find({ _id: req.params.deckId, user: req.user.id });

    if (deck.length === 0) {
      return next(new ErrorResponse(`Deck with id ${req.params.deckId} was not found`, 404));
    }

    // Look for vocabulary front in deck to ensure it is unique
    const vocabularybyName = await Vocabulary.findOne({ front: req.body.front, user: req.user.id, deck: req.params.deckId });

    if (vocabularybyName) {
      return next(new ErrorResponse(`Vocabulary with front ${req.body.front} already exists`, 400));
    }

    const vocabulary = await Vocabulary.create(req.body);

    res.status(200).json({
      success: true,
      data: vocabulary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vocabulary
// @url     PUT /api/v1/decks/:id
// @access  private
exports.updateVocabulary = async (req, res, next) => {
  try {
    let vocabulary = await Vocabulary.find({ _id: req.params.id, user: req.user.id });

    if (vocabulary.length === 0) {
      return next(new ErrorResponse(`Vocabulary with id ${req.params.id} was not found`, 404));
    }

    // Look for vocabulary front in deck to ensure it is unique
    const vocabularybyName = await Vocabulary.findOne({ front: req.body.front, user: req.user.id, deck: vocabulary[0].deck });

    console.log(`${vocabulary[0].deck}`);


    if (vocabularybyName) {
      return next(new ErrorResponse(`Vocabulary with front ${req.body.front} already exists`, 400));
    }

    let reviewDate = Date.now();


    switch (req.body.status) {
      case 2:
        reviewDate += 1000 * 60 * 60 * 24;
        break;
      case 3:
        reviewDate += 1000 * 60 * 60 * 24 * 4;
        break;
      case 4:
        reviewDate += 1000 * 60 * 60 * 24 * 7;
        break;
      case 5:
        reviewDate += 1000 * 60 * 60 * 24 * 30;
        break;
      case 6:
        reviewDate = null;
        break;
      default:
        break;
    }

    req.body.reviewDate = reviewDate;

    vocabulary = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });


    res.status(200).json({
      success: true,
      data: vocabulary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vocabulary
// @url     DELETE /api/v1/decks/:id
// @access  private
exports.deleteVocabulary = async (req, res, next) => {
  try {
    const vocabulary = await Vocabulary.find({ _id: req.params.id, user: req.user.id });

    if (vocabulary.length === 0) {
      return next(new ErrorResponse(`Vocabulary with id ${req.params.id} was not found`, 404));
    }

    vocabulary[0].remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
