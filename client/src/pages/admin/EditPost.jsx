import React from 'react';
import { useParams } from 'react-router-dom';
import PostForm from '../../components/PostForm';

export default function EditPost() {
  const { id } = useParams();
  return <PostForm role="admin" postId={id} />;
}
