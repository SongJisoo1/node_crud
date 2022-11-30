const express = require('express');
const mongoose = require('mongoose');

const Comments = require('../schemas/comment');

const { ObjectId } = mongoose.Types;

const router = express.Router();

//댓글 생성 
router.post('/:_postId', async (req, res, next) => {
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
router.put('/:_commentId', async (req, res) => {

    try{

        const { _commentId } = req.params;
        const { password, content } = req.body;

        const existComments = await Comments.findOne({'_id': ObjectId(_commentId)});

        if(!existComments) {
            return res.status(404).json({'message': '댓글 조회에 실패하였습니다.'});
        }

        if(!content) {
            return res.status(400).json({'message': '댓글 내용을 입력해주세요.'});
        }

        if(!password || password !== existComments.password) {
            return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});
        }

        await Comments.updateOne({'_id': _commentId}, {'$set': {content}});

        return res.status(201).json({'message': '댓글을 수정하였습니다.'});
    
    } catch (err) {

        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});

    }

}); 

// 댓글 삭제
router.delete('/:_commentId', async (req, res) => {
    
    try {
            const { password } = req.body;
            const { _commentId } = req.params;

            const existComments = await Comments.findOne({'_id': ObjectId(_commentId)});

            if(!existComments) {
                return res.status(404).json({'message': '댓글 조회에 실패하였습니다.'});
            }

            if(!password || password !== existComments.password) {
                return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});
            }

            await Comments.deleteOne({'_id': _commentId});

            return res.status(200).json({'message': '댓글을 삭제하였습니다.'});

        } catch (err) {

            res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});

        }

});

module.exports = router;