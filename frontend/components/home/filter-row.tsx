import { View, StyleSheet } from "react-native"
import SelectGenre from "./genre-dropdown"

export function FilterRow({ genre1, setGenre1, genre2, setGenre2 }) {
    return (
        <View style={styles.filterRow}>
            <SelectGenre value={genre1} onChange={setGenre1} placeholder="Genre" />
            {/* <SelectGenre value={genre2} onChange={setGenre2} placeholder="Genre 2" /> */}
      </View>
    )
}

const styles = StyleSheet.create({
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
        marginRight: 4,
      },
})