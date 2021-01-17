import * as I from 'interfaces';
import {
  CommentModel, InfoModel, LinkModel, PostModel, TagModel,
} from 'dao/models';

export const toComment = (cm:CommentModel) => ({
  admin: cm.admin,
  id: cm.id,
  name: cm.name,
  postId: cm.postId,
  text: cm.text,
  updated: cm.updated,
  whenCreated: cm.whenCreated,
  whenUpdated: cm.whenUpdated,
  parentId: cm.parentId,
} as I.Comment);

export const toTag = (tm:TagModel) => ({
  id: tm.id,
  name: tm.name,
} as I.Tag);

export const toPost = (pm:PostModel) => ({
  title: pm.title,
  description: pm.description,
  comments: pm.comments.map((c) => toComment(c)),
  html: pm.html,
  id: pm.id,
  markdown: pm.markdown,
  published: pm.published,
  tags: pm.tags.map((t) => toTag(t)),
  whenCreated: pm.whenCreated,
  whenPublished: pm.whenPublished,
  whenUpdated: pm.whenUpdated,
} as I.Post);

export const toLink = (lm: LinkModel) => ({
  href: lm.href,
  name: lm.name,
} as I.Link);

export const toInfo = (im: InfoModel) => ({
  description: im.description,
  href: im.href,
  links: im.links.map((l) => toLink(l)),
  title: im.title,
} as I.Info);
