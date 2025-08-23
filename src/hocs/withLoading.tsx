import { FC, useState, useEffect, ComponentType } from 'react';
import { Loader } from '@/components/ui/loader';

interface WithLoadingProps {
  [key: string]: any;
}

const withLoading = <P extends object>(
  WrappedComponent: ComponentType<P>
): FC<P & WithLoadingProps> => {
  const WithLoading: FC<P & WithLoadingProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // Simulate loading time

      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader size={48} />
        </div>
      );
    }

    return <WrappedComponent {...(props as P)} />;
  };

  return WithLoading;
};

export default withLoading;