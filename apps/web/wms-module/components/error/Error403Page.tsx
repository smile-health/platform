import CustomError from '@/components/CustomError';
import React from 'react';

const Error403Page: React.FC = () => <CustomError error="403" withLayout />;

export default Error403Page;
