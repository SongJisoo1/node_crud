const express = require('express');
const mongoose = require('mongoose');

const Comments = require('../schemas/comment');

const { ObjectId } = mongoose.Types;

const router = express.Router();

//댓글 생성 
router.post('/:_postId', async (req, res) => {
    const { _postId } = req.params;
    const { user, password, content } = req.body;

    if(!content) {
        return res.status(400).json({ 'message': '댓글 내용을 입력해주새요'});
    }

    const validBody = Object.values(req.body).filter((value) => !value).length;

    if(validBody || !ObjectId.isValid(_postId)) {
        return res.status(400).json({ 'message': '데이터 형식이 올바르지 않습니다.'});
    } 

    await Comments.create({ 'postId': _postId, user, password, content });

    return res.status(201).json({ 'message': '댓글을 생성하였습니다.' });

});

//댓글 조회
router.get('/:_postId', async (req, res) => {

    const { _postId } = req.params;

    if(!_postId || !ObjectId.isValid(_postId)) {
        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});
    }

    const existComments = await Comments.find({'postId': _postId}, {'postId': 0, 'password': 0}).sort({'createdAt': -1});

    const convertComments = existComments.map((value) => {
        return {
            'commentId': value._id,
             'user': value.user,
             'content': value.content,
             'createdAt': value.createdAt,
        }
    }); 

    return res.json({'data': convertComments});
});

//댓글 수정
router.put('/:_postId', async (req, res) => {
    const { _postId } = req.params;
    const { password, content } = req.body;

    if(!content) {
        return res.status(400).json({'message': '댓글 내용을 입력해주세요.'});
    }

    if(!ObjectId.isValid(_postId) || !password) {
        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});
    }

    const existComments = Comments.findOne({$and: [{'postId': _postId}, {password}]});

    if(!existComments) {
        return res.status(404).json({'message': '댓글 조회에 실패하였습니다.'});
    }

    await Comments.updateOne({'postId': _postId}, {'$set': { content }});

    return res.status(201).json({'message': '댓글을 수정하였습니다.'});

}); 

// 댓글 삭제
router.delete('/:_postId', async (req, res) => {
    const { password } = req.body;
    const { _postId } = req.params;


    if(!password) {
        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});
    }

    const existComments = await Comments.findOne({$and: [{'postId': _postId}, {password}]});

    if(!existComments) {
        return res.status(404).json({'message': '댓글 조회에 실패하였습니다.'});
    }

    await Comments.deleteOne({'post': _postId});

    return res.status(200).json({'message': '댓글을 삭제하였습니다.'});

});

module.exports = router;