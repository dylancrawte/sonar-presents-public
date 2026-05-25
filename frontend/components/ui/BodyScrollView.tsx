import { forwardRef } from "react";
import { ScrollView, ScrollViewProps } from "react-native";

export const BodyScrollView = forwardRef<any, ScrollViewProps>((props, ref) => {
  return (
    <ScrollView
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="never"
      contentInset={{ bottom: 0 }}
      scrollIndicatorInsets={{ bottom: 0 }}
      {...props}
      ref={ref}
    />
  );
});

export default BodyScrollView;
BodyScrollView.displayName = 'BodyScrollView';