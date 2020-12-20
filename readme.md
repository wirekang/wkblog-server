# 개요
백엔드 환경에서 typescript를 사용할 때를 위해 만든 저장소입니다. eslint, 절대 경로 import, 디버깅, webpack을 통한 배포 등 유용한 것을 모아놨습니다. 

# 실행
node를 실행시킵니다.
```npm start```

# 디버깅
--inspect 옵션으로 node를 실행시키는데, nodemon을 사용해서 소스코드가 수정 될 때마다 재시작됩니다.
```npm run debug```
이 상태에서 **F5**키를 눌러 **launch.json**에 등록된  **Node: Attach**를 실행시키면 디버깅을 할 수 있습니다. restart 옵션이 달려있기 때문에 소스코드를 수정 후 nodemon이 프로그램을 다시 시작해도 디버거가 유지됩니다.

# 배포
webpack을 사용하여 배포합니다.
```npm run build```