import Text from '@shared/Text';
import Flex from '@shared/Flex';
import Spacing from '@shared/Spacing';
import ListRow from '@shared/ListRow';
import Button from '@shared/Button';
import TextField from '@shared/TextField';
import useReview from './hooks/useReview';
import useUser from '@hooks/auth/useUser';
import { ChangeEvent, useCallback, useState } from 'react';
import { format } from 'date-fns';

function Review({ hotelId }: { hotelId: string }) {
  const {
    data: reviews,
    isLoading,
    write,
    remove,
    update,
  } = useReview({ hotelId });
  const user = useUser();
  const [text, setText] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editedText, setEditedText] = useState('');

  const handleEditedTextChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedText(e.target.value);
    },
    [],
  );

  const reviewRows = useCallback(() => {
    if (reviews?.length === 0) {
      return (
        <Flex direction="column" align="center" style={{ margin: '40px 0' }}>
          <img
            src="https://cdn4.iconfinder.com/data/icons/business-and-finance-colorful-free-hand-drawn-set/100/message_open-64.png"
            alt=""
          />
          <Spacing size={10} />
          <Text typography="t6">
            아직 작성된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
          </Text>
        </Flex>
      );
    }

    return (
      <ul>
        {reviews?.map((review) => (
          <ListRow
            key={review.id}
            left={
              review.user.photoURL != null ? (
                <img src={review.user.photoURL} alt="" width={40} height={40} />
              ) : null
            }
            contents={
              isEdit ? (
                <TextField
                  value={editedText}
                  onChange={handleEditedTextChange}
                />
              ) : (
                <ListRow.Texts
                  title={review.text}
                  subTitle={format(review.createdAt, 'yyyy-MM-dd')}
                />
              )
            }
            right={
              review.userId === user?.uid ? (
                <Flex align="center">
                  {isEdit ? (
                    <Button
                      onClick={async () => {
                        const success = await update({
                          reviewId: review.id,
                          hotelId: review.hotelId,
                          text: editedText,
                        });

                        if (success === true) {
                          setEditedText('');
                          setIsEdit(false);
                        }
                      }}
                    >
                      확인
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsEdit(true);
                        setEditedText(review.text);
                      }}
                    >
                      수정
                    </Button>
                  )}
                  <Spacing size={4} direction="horizontal" />
                  <Button
                    onClick={() => {
                      remove({ reviewId: review.id, hotelId: review.hotelId });
                    }}
                  >
                    삭제
                  </Button>
                </Flex>
              ) : null
            }
          />
        ))}
      </ul>
    );
  }, [reviews, user, isEdit, editedText]);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  if (isLoading === true) {
    return null;
  }

  return (
    <div style={{ margin: '40px 0' }}>
      <Text bold={true} typography="t4" style={{ padding: '0 24px' }}>
        리뷰
      </Text>
      <Spacing size={16} />
      {reviewRows()}
      {user != null ? (
        <div style={{ padding: '0 24px' }}>
          <TextField value={text} onChange={handleTextChange} />
          <Spacing size={6} />
          <Flex justify="flex-end">
            <Button
              disabled={text === ''}
              onClick={async () => {
                const success = await write(text);

                if (success === true) {
                  setText('');
                }
              }}
            >
              작성
            </Button>
          </Flex>
        </div>
      ) : null}
    </div>
  );
}

export default Review;
