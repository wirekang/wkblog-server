import { CommentModel, PostModel, TagModel } from 'db/models';
import {
  Comment, Post, PostSummary, Tag,
} from 'interfaces';

export function toPost(pm:PostModel): Post {
  return {
    comments: pm.comments.map((c) => toComment(c)),
    description: pm.description,
    html: pm.html,
    id: pm.id,
    published: pm.published,
    tags: pm.tags,
    title: pm.title,
    whenCreated: pm.whenCreated,
    whenPublished: pm.whenPublished,
    whenUpdated: pm.whenUpdated,
  };
}

export function toTag(tm:TagModel): Tag {
  return {
    id: tm.id,
    name: tm.name,
  };
}

export function toComment(cm:CommentModel): Comment {
  return {
    childrenIds: cm.children ? cm.children.map((c) => c.id) : [],
    id: cm.id,
    name: cm.name,
    parentId: cm.parentId,
    password: cm.password,
    postId: cm.postId,
    text: cm.text,
    whenCreated: cm.whenCreated,
    whenUpdated: cm.whenUpdated,
    updated: cm.updated,
  };
}
