import { type MessageInitShape } from '@bufbuild/protobuf';
import {
  ViewReqSchema,
  ViewReplySchema,
  type ViewReply,
} from '../../grpc/bilibili/app/view/v1/view_pb';
import { BILI_GRPC_URL, sendBiliGrpcRequest } from './biliGRPC';

interface ViewProps {
  bvid?: string;
  aid?: bigint;
}

export const fetchBiliView = async ({
  bvid,
  aid,
}: ViewProps): Promise<ViewReply> => {
  const reqObj: MessageInitShape<typeof ViewReqSchema> = { bvid, aid };
  return sendBiliGrpcRequest(
    ViewReqSchema,
    ViewReplySchema,
    '/bilibili.app.view.v1.View/View',
    reqObj,
    BILI_GRPC_URL,
  );
};
