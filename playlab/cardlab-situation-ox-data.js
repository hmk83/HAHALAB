(function () {
  'use strict';
  // Each row: title | depicted action | target judgement | explanatory feedback | category | illustration scene.
  const banks = {
    preschool: [
      ['식사 전 손 씻기','밥을 먹기 전에 비누로 손을 씻고 있어요.',true,'식사 전에는 비누로 손을 깨끗하게 씻어요.','생활 습관','A five-year-old child rubbing soapy hands together at a child-height sink before a meal, visible soap bubbles and a prepared dining table in background.'],
      ['장난감 정리','놀이가 끝나서 블록을 상자에 넣고 있어요.',true,'놀이가 끝나면 장난감을 제자리에 정리해요.','생활 습관','A five-year-old putting scattered colorful blocks into a low storage box after play, hands visibly placing one block inside.'],
      ['미끄럼틀 차례','앞 친구가 내려간 뒤에 미끄럼틀을 타요.',true,'앞 친구가 비킨 것을 확인한 뒤에 내려가요.','놀이 안전','A child seated at the top of a low slide waiting, while the previous child has stepped clear of the bottom; an adult watches nearby.'],
      ['도움을 요청해요','높은 선반의 물건은 어른에게 꺼내 달라고 해요.',true,'손이 닿지 않는 높은 곳은 어른에게 도움을 요청해요.','생활 안전','A small child on the floor pointing to a toy on a high shelf while a caregiver reaches for it; no climbing furniture.'],
      ['기침할 때','기침이 나서 옷소매로 입과 코를 가려요.',true,'기침할 때는 옷소매로 입과 코를 가려요.','생활 습관','A child coughing gently into their bent elbow, nose and mouth covered by sleeve, at kindergarten.'],
      ['횡단보도 기다리기','보행자 신호가 빨간불이라 보호자와 기다려요.',true,'빨간불에는 보도에서 기다려요.','교통 안전','A child holding a caregiver hand safely on sidewalk at a crossing; pedestrian signal clearly shows a red standing person, both waiting behind curb.'],
      ['빌려 쓰기','친구의 색연필을 쓰기 전에 허락을 구해요.',true,'친구 물건은 먼저 물어보고 허락을 받아요.','함께 생활','A child with empty hands politely asking a seated friend about the friend colored pencil set, friend nodding with open hand.'],
      ['그네 옆에서','친구가 그네를 타서 안전선 밖에서 기다려요.',true,'움직이는 그네 가까이 가지 않고 떨어져 기다려요.','놀이 안전','A child waiting outside a clearly painted playground safety boundary while another child swings, generous visible distance.'],
      ['쏟은 물','바닥에 물을 쏟아서 어른에게 알려요.',true,'미끄러질 수 있으니 어른에게 알리고 함께 닦아요.','생활 안전','A child pointing out a small water spill to a caregiver approaching with a cloth; everyone standing away from spill.'],
      ['도서관에서','책을 읽는 사람이 있어서 작은 목소리로 말해요.',true,'조용히 책을 읽는 공간에서는 작은 목소리로 이야기해요.','공공장소','A child leaning toward a caregiver and speaking softly, relaxed readers and bookshelves around them in a library.'],
      ['안전띠 매기','차에 앉아서 어린이용 좌석의 안전띠를 매요.',true,'차가 움직이기 전에 알맞은 어린이용 좌석과 안전띠를 사용해요.','교통 안전','A child correctly secured in an age-appropriate car child seat with harness, caregiver checking belt while vehicle is parked.'],
      ['쓰레기 버리기','다 먹은 간식 포장지를 쓰레기통에 넣어요.',true,'쓰레기는 바닥에 버리지 않고 알맞은 통에 넣어요.','함께 생활','A kindergarten child placing an empty snack wrapper directly into a park rubbish bin.'],
      ['계단 내려가기','난간을 잡고 계단을 천천히 내려가요.',true,'계단에서는 난간을 잡고 한 칸씩 천천히 이동해요.','생활 안전','A child descending low indoor stairs slowly, hand gripping handrail and one foot on each adjacent step.'],
      ['불편하다고 말해요','보라색 옷을 입은 아이가 친구에게 멈춰 달라고 말하고 선생님께 도움을 청해요.',true,'몸이 불편하면 멈춰 달라고 말하고 믿을 수 있는 어른에게 알려요.','자기 보호','A child holding up a stop hand after a peer releases their wrist, turning to a nearby attentive teacher; no injury, no grabbing in progress.'],
      ['길을 잃었어요','보호자가 안 보여서 안내 직원에게 도움을 요청해요.',true,'혼자 멀리 이동하지 말고 안내 직원에게 도움을 요청해요.','자기 보호','A small child at a shopping mall information desk speaking to a clearly identifiable uniformed staff member behind counter, no text.'],
      ['친구 밀기','빨리 타려고 앞에서 기다리는 친구를 밀어요.',false,'친구를 밀지 말고 자기 차례를 기다려요.','함께 생활','A child at a low slide queue extending both hands to shove the back of the child ahead, all feet on flat ground and nobody falling.'],
      ['도로의 공','공을 주우려고 보호자 없이 차도로 나가려 해요.',false,'차도로 나가지 말고 보호자에게 알려요.','교통 안전','A child reaching from sidewalk toward a ball on the roadway, caregiver several steps behind, child not yet entering road, no approaching collision.'],
      ['콘센트 장난','콘센트 구멍에 장난감 막대를 넣으려고 해요.',false,'콘센트에 물건을 넣지 않아요.','생활 안전','A child holding a toy stick near but not touching wall socket, clear unsafe intent, no sparks or injury.'],
      ['의자 위에서','높은 물건을 꺼내려고 흔들리는 의자에 올라가요.',false,'흔들리는 의자에 올라가지 말고 어른에게 부탁해요.','생활 안전','A small child standing on an unstable chair reaching toward high shelf, chair tilted slightly, no fall shown.'],
      ['모래 던지기','놀이터에서 친구 쪽으로 모래를 던져요.',false,'모래가 눈에 들어갈 수 있으니 친구에게 던지지 않아요.','놀이 안전','A child throwing a small handful of sand toward another child in sandbox, visible arc away from faces, no injury.'],
      ['약을 발견했어요','탁자 위 약을 사탕인 줄 알고 먹으려고 해요.',false,'모르는 약은 먹지 말고 어른에게 알려요.','생활 안전','A child lifting a tablet from an open medicine blister toward mouth but not eating, medicine bottle visible on table, no ingestion.'],
      ['책을 찢어요','책 속 그림이 갖고 싶어서 책장을 찢어요.',false,'함께 보는 책은 찢지 않고 소중하게 다뤄요.','함께 생활','A child visibly tearing one illustrated page from a shared library picture book, hands pulling page in opposite directions.'],
      ['세면대에서 물장난','손을 씻다가 친구에게 물을 세게 뿌려요.',false,'물은 세면대 안에서 사용하고 친구에게 뿌리지 않아요.','생활 습관','A child at a school sink dramatically scooping and flinging a large fan of water directly onto a nearby child, clearly visible water arc and large splashes across clothes and floor, friend shielding face with hands, taps visible, no injury.'],
      ['친구 음식 가져가기','초록 줄무늬 옷을 입은 아이가 허락 없이 친구 접시의 과자를 가져가요.',false,'친구 음식을 마음대로 가져가지 않아요.','함께 생활','A child reaching across and taking a snack directly from another child plate without asking, friend looks surprised.'],
      ['미끄럼틀 거꾸로','친구가 위에서 차례를 기다리는데 미끄럼틀을 아래에서 올라가요.',false,'미끄럼틀은 계단으로 올라가고 아래로 내려와요.','놀이 안전','A child climbing upward on the slide surface while another child is waiting at top, no collision, playground scene.'],
      ['뜨거운 냄비','뜨거운 냄비를 혼자 만지려고 해요.',false,'뜨거운 조리 도구는 만지지 말고 어른에게 부탁해요.','생활 안전','A young child reaching toward a steaming pot on kitchen counter but not touching it; caregiver nearby, no injury.'],
      ['입에 넣은 장난감','작은 구슬을 입에 넣으려고 해요.',false,'작은 장난감은 입에 넣지 않아요.','생활 안전','A child holding a small marble just away from open mouth, other marbles visible on play tray; no ingestion.'],
      ['복도에서 뛰어요','친구들이 다니는 복도에서 빠르게 뛰어요.',false,'복도에서는 부딪히지 않도록 천천히 걸어요.','공공장소','A child sprinting through kindergarten corridor with other children walking, energetic running pose, no collision.'],
      ['강아지와 산책','멈춰 선 강아지를 가려고 하는 쪽으로 세게 잡아당겨요.',false,'강아지가 멈추면 억지로 당기지 말고 보호자와 상태를 살펴요.','함께 생활','A child leaning their entire body backward while pulling a visibly taut dog leash with both hands, small dog wearing a broad chest harness plants all four paws and leans in opposite direction refusing to move, obvious opposing forces, no neck choking or injury, adult approaching to help.'],
      ['가위로 장난','가위를 든 손을 친구 쪽으로 휘둘러요.',false,'가위는 친구에게 휘두르지 않고 정해진 자리에서 안전하게 사용해요.','생활 안전','A child standing and waving child-safe blunt scissors toward a classmate from a distance, no contact or injury.']
    ],
    lower: [
      ['손들고 말하기','수업 중 질문이 생겨 손을 들고 기다려요.',true,'말할 차례를 기다리면 서로의 이야기를 들을 수 있어요.','학교 생활','An eight-year-old seated at classroom desk raising hand while teacher listens to another student.'],
      ['연필 돌려주기','빌린 연필을 사용한 뒤 주인에게 돌려줘요.',true,'빌린 물건은 사용 후 주인에게 돌려줘요.','함께 생활','An elementary child handing a borrowed pencil back to its owner across two desks.'],
      ['횡단보도 확인','초록불에 차가 멈췄는지 살핀 뒤 건너요.',true,'초록불에도 차가 멈췄는지 확인하고 건너요.','교통 안전','A child at pedestrian crossing checking both directions, green walking signal and cars fully stopped behind lines, one foot beginning to cross.'],
      ['헬멧 쓰기','자전거를 타기 전에 헬멧 끈을 잠가요.',true,'자전거를 탈 때는 크기에 맞는 헬멧을 바르게 써요.','놀이 안전','An eight-year-old beside bicycle fastening helmet chin strap correctly at a safe park path.'],
      ['물건의 주인 찾기','교실에서 주운 지갑을 선생님께 맡겨요.',true,'주운 물건은 선생님이나 관리 직원에게 맡겨 주인을 찾아요.','함께 생활','A child handing a found small wallet to a teacher at classroom desk, no money being removed.'],
      ['친구의 말 듣기','친구가 이야기할 때 말을 끊지 않고 들어요.',true,'말을 마칠 때까지 들은 뒤 내 생각을 말해요.','관계와 감정','Two elementary friends talking at a table, one speaking and the other listening attentively with mouth closed.'],
      ['실수 알리기','친구 물통을 떨어뜨려 망가뜨려서 사실대로 말해요.',true,'실수했을 때는 사실을 말하고 해결할 방법을 함께 찾아요.','관계와 감정','A child pointing to a cracked plastic water bottle and apologetically speaking to its owner, teacher available nearby.'],
      ['도움받기','친구가 계속 놀려서 선생님께 도움을 요청해요.',true,'계속되는 놀림은 혼자 참지 말고 믿을 수 있는 어른에게 알려요.','자기 보호','A concerned child speaking privately to a teacher while two teasing classmates stand far in background; teacher attentive.'],
      ['급식 줄 서기','급식실에서 먼저 온 친구 뒤에 줄을 서요.',true,'먼저 온 순서대로 차례를 기다려요.','학교 생활','Children with empty trays queuing orderly at school cafeteria, arriving child joins at the end.'],
      ['모르는 링크','모르는 사람이 보낸 링크를 누르기 전에 보호자에게 물어요.',true,'모르는 링크는 열지 않고 보호자에게 먼저 확인해요.','디지털 생활','An elementary child showing a tablet message with an abstract link icon to caregiver, finger away from screen.'],
      ['버스에서 내릴 때','버스가 아직 움직이고 있어서 자리에 앉아 기다려요.',true,'버스가 완전히 멈춘 다음 안전하게 이동해요.','교통 안전','A child remaining seated on school bus as it comes to a stop, adult driver and bus stop visible outside.'],
      ['함께 정한 규칙','놀이 전에 정한 순서대로 역할을 바꿔요.',true,'함께 정한 규칙을 지키고 바꾸고 싶으면 먼저 의논해요.','함께 생활','Children exchanging role badges in a cooperative playground game, waiting child receives badge calmly.'],
      ['친구의 거절','친구가 사진을 찍기 싫다고 해서 카메라를 내려요.',true,'사진 찍기를 원하지 않으면 그 뜻을 존중해요.','디지털 생활','A child lowering a camera after friend clearly raises a palm to decline photograph, both calm.'],
      ['비 오는 날','우산을 쓰고 친구와 간격을 두어 우산 끝이 닿지 않게 걸어요.',true,'우산 끝이 다른 사람을 향하지 않도록 조심해요.','생활 안전','Children walking in rain with umbrellas held safely upward and tips away from faces, clear spacing.'],
      ['몸이 아플 때','수업 중 배가 아파 선생님께 알려요.',true,'몸이 아프면 참기보다 선생님이나 보호자에게 알려요.','자기 보호','A child seated with hand on stomach quietly telling a caring teacher, no dramatic distress.'],
      ['줄 앞에 끼어들기','급식 줄이 길어서 친구들 앞으로 끼어들어요.',false,'줄의 맨 뒤에서 자기 차례를 기다려요.','학교 생활','A child moving sideways with tray into the front of an existing cafeteria queue, queued children look surprised.'],
      ['화나서 물건 던지기','놀이에서 져서 친구 쪽으로 블록을 던져요.',false,'화가 나면 물건을 내려놓고 잠깐 쉬거나 말로 표현해요.','관계와 감정','A frustrated child throwing a foam block toward a peer across a play table, block safely in air away from faces.'],
      ['친구 답 베끼기','풀기 어려워서 친구 시험 답을 그대로 베껴요.',false,'시험에서는 스스로 풀고 모르는 내용은 시험 후에 배워요.','학교 생활','A child looking sideways at neighbor worksheet during a clearly separated classroom test, copying marks, no readable text.'],
      ['책에 낙서하기','도서관에서 빌린 책에 그림을 그려요.',false,'빌린 책에는 낙서하지 않고 내 종이에 그려요.','공공장소','A child drawing with marker directly on pages of a library-stamped book, library shelves visible.'],
      ['안전띠 풀기','차가 달리는 중에 답답해서 안전띠를 풀어요.',false,'차가 움직이는 동안 안전띠를 바르게 매고 있어요.','교통 안전','Child seated in moving car reaching to unbuckle seat belt, blurred exterior indicating movement, no crash.'],
      ['친구 가방 열기','궁금해서 허락 없이 친구 가방을 열어 봐요.',false,'친구 물건은 허락 없이 열거나 살펴보지 않아요.','함께 생활','An elementary child opening a classmate backpack on another desk while owner is away, clearly rummaging hand.'],
      ['개인정보 보내기','온라인에서 처음 만난 사람에게 집 주소를 보내요.',false,'주소와 연락처는 모르는 사람에게 보내지 않아요.','디지털 생활','Child typing a house-location pin into chat with unknown silhouette avatar on tablet; generic icons only, no real personal data.'],
      ['계단 장난','계단에서 앞 친구의 가방을 잡아당겨요.',false,'계단에서는 친구나 가방을 잡아당기지 않아요.','생활 안전','Child tugging the backpack of a classmate on low school stairs, feet stable, nobody falling.'],
      ['혼자 멀리 가기','현장 학습 중 선생님께 말하지 않고 혼자 다른 곳으로 가요.',false,'단체 활동에서는 이동 전에 담당 어른에게 알려요.','자기 보호','Child quietly walking away from supervised museum school group toward a different corridor while teacher faces group.'],
      ['공용 물건 숨기기','친구가 못 쓰게 교실 공용 공을 가방에 숨겨요.',false,'함께 쓰는 물건은 정해진 곳에 두고 같이 사용해요.','함께 생활','A child stuffing the classroom shared ball into personal backpack behind a shelf while other children look for it.'],
      ['젖은 손과 전기','손이 젖은 채로 전기 플러그를 만지려고 해요.',false,'젖은 손으로 전기 기구를 만지지 말고 어른에게 부탁해요.','생활 안전','Child with dripping wet hands reaching near a plugged electrical cord, no contact, sparks or injury.'],
      ['싫다는 별명','친구가 싫다고 했는데 같은 별명을 계속 불러요.',false,'친구가 싫어하는 호칭은 멈추고 원하는 이름으로 불러요.','관계와 감정','One child jeering toward a classmate who clearly signals stop with palm and uncomfortable expression; no words in speech bubbles.'],
      ['운동장 유리 조각','운동장에서 발견한 유리 조각을 맨손으로 주워요.',false,'날카로운 조각은 만지지 말고 어른에게 위치를 알려요.','생활 안전','Child reaching a bare hand toward a few glass fragments on schoolyard ground, hand not touching, no injury.'],
      ['문 앞에서 밀기','문이 열리자 먼저 나가려고 친구들을 밀어요.',false,'출입문에서는 밀지 않고 차례로 이동해요.','학교 생활','A child pushing into a group at classroom doorway to go first, everyone upright, no fall.'],
      ['식물 꺾기','공원에서 함께 보는 꽃을 마음대로 꺾어요.',false,'공원의 꽃은 꺾지 않고 눈으로 관찰해요.','공공장소','A child snapping a planted flower stem in a public park flowerbed, visible public path and other intact flowers.']
    ],
    upper: [
      ['사진 공유 전 확인','친구의 사진을 단체 대화방에 올리기 전에 허락을 구해요.',true,'사진을 찍는 것과 공유하는 것은 달라요. 공유 전에도 허락을 확인해요.','디지털 생활','An eleven-year-old showing a group photo on phone to the pictured friend for permission before sharing; finger away from send button.'],
      ['출처 확인하기','놀라운 소식을 보고 공식 안내에서 사실인지 확인해요.',true,'놀라운 정보도 바로 퍼뜨리지 않고 신뢰할 수 있는 출처를 확인해요.','디지털 생활','A preteen comparing a sensational message on phone with school official notice board on laptop, generic document and school icons.'],
      ['역할 다시 나누기','모둠 친구가 어려워해서 할 수 있는 일을 함께 다시 나눠요.',true,'서로 할 수 있는 일을 듣고 역할을 공정하게 조정해요.','협력과 책임','Four preteens around project table redistributing task cards after one asks for help, each included.'],
      ['거절을 존중해요','파란색 옷을 입은 아이가 친구의 그만하라는 말을 듣고 장난 도구를 내려요.',true,'장난이어도 상대가 원하지 않으면 멈춰요.','관계와 감정','A preteen lowering a playful prop immediately when friend raises stop palm, respectful expressions.'],
      ['친구에게 사과해요','내 말에 친구가 속상했어요. 지금 친구에게 사과하고 같은 말을 하지 않겠다고 이야기해요.',true,'상처 준 말은 사과하고 반복하지 않도록 행동을 바꿔요.','디지털 생활','A preteen apologizing directly to friend while showing deletion of own message on phone, generic icons, no readable insults.'],
      ['출처를 밝혀요','발표에 쓴 자료 옆에 어디에서 찾았는지 적어요.',true,'다른 사람이 만든 자료를 쓸 때는 출처와 이용 조건을 확인해요.','학교 생활','A preteen adding a source reference line below an image on school presentation laptop, teacher and reference book nearby, no readable text.'],
      ['험담을 멈춰요','보라색 옷을 입은 아이가 친구를 놀리는 대화에 참여하지 않고 멈추자고 말해요.',true,'누군가를 괴롭히는 말에 동참하지 않고 필요하면 어른에게 도움을 요청해요.','관계와 감정','One preteen calmly raising an open hand to interrupt peers mocking another child, supportive nonconfrontational posture.'],
      ['비밀번호 보호','친한 친구가 물어봐도 계정 비밀번호는 알려 주지 않아요.',true,'친한 사이여도 비밀번호는 공유하지 않아요.','디지털 생활','Preteen politely declining to reveal laptop password to friend, screen shows only masked password dots and lock icon.'],
      ['약속 변경 알리기','약속 시간에 늦게 되어 미리 연락하고 새 시간을 의논해요.',true,'약속이 바뀌면 상대가 기다리지 않도록 미리 알려요.','협력과 책임','Preteen sending notice while looking at clock and transit delay display, waiting friend shown only as generic contact icon.'],
      ['위험한 도전 거절','보라색 옷을 입은 아이가 높은 난간에 올라가자는 친구의 제안을 거절해요.',true,'친구의 제안이어도 위험한 행동은 거절할 수 있어요.','자기 보호','Preteen safely on ground holding stop palm toward a high railing another child points to, nobody climbing.'],
      ['동의한 규칙 지키기','경기에서 불리해져도 시작 전에 정한 규칙을 지켜요.',true,'규칙을 바꾸려면 경기를 멈추고 모두와 먼저 의논해요.','협력과 책임','Preteens playing board game, losing child calmly following agreed turn order and passing dice.'],
      ['이해를 확인해요','친구 말이 이해되지 않아 뜻을 다시 물어요.',true,'짐작해서 판단하기보다 뜻을 확인하면 오해를 줄일 수 있어요.','관계와 감정','Two preteens discussing a worksheet, one gestures a thoughtful question and the other explains calmly.'],
      ['의심스러운 요구','온라인 상대가 비밀 사진을 요구해서 대화를 멈추고 보호자에게 알려요.',true,'불편한 요구는 응하지 않고 믿을 수 있는 어른에게 알려요.','자기 보호','Preteen placing phone face up in front of trusted caregiver and asking for help, screen generic unknown profile and camera request icon, no sensitive image.'],
      ['공용 기기 로그아웃','도서관 컴퓨터를 다 쓴 뒤 내 계정에서 로그아웃해요.',true,'공용 기기에서는 사용 후 로그아웃하고 개인정보가 남지 않았는지 확인해요.','디지털 생활','Preteen selecting logout icon on public library computer before standing up, lock screen appears.'],
      ['분실 카드 신고','주운 교통카드를 사용하지 않고 분실물 센터에 맡겨요.',true,'주운 카드와 돈은 사용하지 않고 담당자에게 맡겨요.','협력과 책임','Preteen handing a found transit card to station lost-property staff at service counter.'],
      ['사진 공유','친구가 올리지 말라고 한 사진을 대화방에 공유해요.',false,'공유하지 말라는 뜻을 존중하고 사진을 올리지 않아요.','디지털 생활','Preteen pressing share on a friend photo while pictured friend beside them clearly raises stop hand, generic phone UI.'],
      ['친구 이야기','확인하지 않은 친구 이야기를 사실처럼 다른 친구에게 전해요.',false,'확인하지 않은 이야기는 퍼뜨리지 않아요.','관계와 감정','Preteen whispering gossip to a peer while pointing at absent classmate portrait on phone, uncertain question-mark icon on original message.'],
      ['온라인 비웃기','친구가 틀린 답을 쓴 화면을 찍어 모두에게 비웃으며 보여줘요.',false,'친구의 실수를 공개해 놀리지 않고 서로 배울 기회로 존중해요.','디지털 생활','Preteen laughing and showing a photographed wrong worksheet answer on phone to peers, owner looks uncomfortable, no readable text.'],
      ['역할 떠넘기기','내가 맡은 모둠 일을 말없이 친구에게 전부 떠넘겨요.',false,'맡은 일이 어려우면 먼저 알리고 함께 조정해요.','협력과 책임','A preteen pushing their whole stack of project materials onto an already busy teammate while walking away.'],
      ['그림 제출','인터넷에서 받은 그림을 내가 그렸다고 제출해요.',false,'다른 사람의 작품을 내 작품이라고 하지 않아요.','학교 생활','A preteen handing in a printed drawing while same drawing appears as downloaded file on laptop, own sketchbook blank; generic icons.'],
      ['게임 아이템','보호자 허락 없이 저장된 카드로 게임 아이템을 사요.',false,'결제하기 전에는 보호자와 약속한 절차에 따라 허락을 받아요.','디지털 생활','Preteen alone pressing purchase button represented by shopping cart on game screen with saved card icon, caregiver absent.'],
      ['단체 대화방','의견이 다르다는 이유로 친구를 단체방에서 몰래 내보내요.',false,'의견이 다르면 이유를 듣고 이야기로 조정해요.','관계와 감정','A preteen removing a classmates avatar from group chat on tablet while others discuss a project, visible remove-person icon.'],
      ['전화하기','재미있을 것 같아서 실제 위험이 없는데 긴급 신고를 해요.',false,'긴급 신고는 실제 도움이 필요한 상황에서 사용해요.','공공장소','A preteen laughing while making a prank call with emergency service icon on phone, peaceful room with no danger, no numbers.'],
      ['글 공유','제목만 보고 내용과 출처를 확인하지 않은 글을 퍼뜨려요.',false,'공유 전에는 내용을 읽고 사실과 출처를 확인해요.','디지털 생활','Preteen instantly forwarding an unopened article on phone, closed document thumbnail and share arrow clearly shown.'],
      ['실수 숨기기','공용 태블릿을 망가뜨리고 다른 친구가 했다고 말해요.',false,'내 실수는 사실대로 알리고 해결 방법을 함께 찾아요.','협력과 책임','Preteen pointing blame at uninvolved peer while hiding a damaged school tablet behind their back, no sharp fragments.'],
      ['통제선 넘기','사진을 찍으려고 공사장 통제선 안으로 들어가요.',false,'통제선은 위험한 장소를 구분하므로 밖에 머물러요.','생활 안전','Preteen stepping across clearly visible construction barrier tape while holding camera, distant inactive machinery, no injury.'],
      ['위치 공유','친구와 있는 장소를 친구 허락 없이 공개 계정에 올려요.',false,'다른 사람의 위치도 개인정보예요. 공개하기 전에 허락을 확인해요.','디지털 생활','Preteen posting live location pin alongside friend avatar to a public globe icon feed, friend beside looks unaware.'],
      ['쉬는 친구 강요','친구가 몸이 아프다고 했는데 운동 경기에 꼭 나오라고 강요해요.',false,'몸 상태를 존중하고 쉬거나 도움받을 수 있게 해요.','관계와 감정','Preteen pulling a resting friend toward a sports court despite friend holding stomach and raising stop palm, no injury.'],
      ['불리해서 규칙 변경','게임에서 지고 있어서 친구와 상의하지 않고 규칙을 바꿔요.',false,'규칙 변경은 나에게 유리한지와 관계없이 모두의 동의가 필요해요.','협력과 책임','Losing preteen moving a board-game finish marker closer to own piece while other players gesture surprise.'],
      ['공용 컴퓨터 사용','공용 컴퓨터에 로그인한 채로 자리를 떠나요.',false,'사용을 마친 공용 컴퓨터에서는 내 계정에서 로그아웃해요.','디지털 생활','Preteen leaving a library computer while screen still displays personal profile avatar and open inbox, no real personal text.']
    ]
  };
  const meta = [
    ['preschool', '유치원', '유치원생', '눈에 보이는 행동과 생활 안전'],
    ['lower', '초등 저학년', '초등 1~3학년', '학교생활, 차례와 친구의 마음'],
    ['upper', '초등 고학년', '초등 4~6학년', '동의, 책임과 디지털 생활']
  ];
  const style = 'Independent single-scene landscape 4:3 FLAT 2D TEXTBOOK ILLUSTRATION for Korean children. Hand-drawn clean outlines, solid flat color areas, restrained soft shading, modern educational picture-book art. NOT photograph, NOT photorealistic, NOT 3D render, NOT anime, NOT chibi. Natural age-appropriate proportions, clearly readable hands and action, expressive but not babyish, warm bright palette, uncluttered composition. Depict exactly the described action, not a corrected alternative. No text, letters, labels, O/X marks, watermarks, collage, injury, blood or branded characters. ';
  // Visually reviewed conditions not recoverable from a still image alone.
  const contextRequired = {
    preschool: [7,14,15,24],
    lower: [2,5,7,12,13,27],
    upper: [1,2,3,4,5,6,7,8,9,10,11,12,13,15,17,20,21,22,23,24,25,29]
  };
  window.SituationOXData = {
    version: 1,
    sessionSize: 12,
    levels: meta.map(([id, label, ageLabel, description]) => ({
      id, label, ageLabel, description,
      items: banks[id].map(([title, story, correct, explanation, category, scene], index) => {
        const itemId = `${id}-${String(index + 1).padStart(2, '0')}`;
        return { id: itemId, title, story, correct, answer: correct, explanation, category, alt: story, requiresContext: contextRequired[id].includes(index + 1),
          image: `images/situation-ox/${itemId}.webp`, imagePrompt: style + scene + (correct ? '' : ' Make the incorrect ACTION visually obvious and exaggerated through the acting child whole-body pose, the object direction, and the other person clear stop gesture or startled reaction. Large clear gestures and motion lines are welcome. Do not portray the acting child as evil. Do not substitute a safe corrected action.') };
      })
    }))
  };
}());
