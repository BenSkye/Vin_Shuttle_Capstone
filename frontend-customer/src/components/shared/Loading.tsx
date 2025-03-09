'use client';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function Loading() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <Spin
                indicator={
                    <LoadingOutlined
                        style={{ fontSize: 48 }}
                        spin
                    />
                }
                tip="Đang tải..."
            />
        </div>
    );
}