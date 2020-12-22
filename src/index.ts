import DA from 'DA';

const da = new DA();

setInterval(() => {
  da.createPost({
    body: 'BODY',
    tags: ['tag1', 'tag2'],
    title: 'TITLE1',
  });
}, 2000);
