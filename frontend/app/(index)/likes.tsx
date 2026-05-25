import { TrackList } from "@/components/songs/track-list";
import { screenPadding } from "@/constants/tokens";
import { View } from "react-native";

export default function SecondTab() {
    return(
        <View style={{ flex: 1, paddingHorizontal: screenPadding.horizontal }}>
            <TrackList />      
        </View>
    )
}