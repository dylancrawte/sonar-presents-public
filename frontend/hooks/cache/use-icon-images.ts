import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const genreIconData: { value: string; lable: string; icon: MciName }[] = [
    { value: '0', lable: 'Pop', icon: 'music-note-outline' },
    { value: '1', lable: 'Rock', icon: 'guitar-electric' },
    { value: '2', lable: 'Indie', icon: 'album' },
    { value: '3', lable: 'Country', icon: 'guitar-acoustic' },
    { value: '4', lable: 'Pop Punk', icon: 'lightning-bolt' },
    { value: '5', lable: 'Metal', icon: 'skull-outline' },
    { value: '6', lable: 'Punk', icon: 'emoticon-devil-outline' },
    { value: '7', lable: 'Shoegaze', icon: 'waveform' },
    { value: '8', lable: 'Bubblegum', icon: 'candy-outline' },
    { value: '9', lable: 'R&B', icon: 'microphone-outline' },
    { value: '10', lable: 'Rap', icon: 'microphone' },
    { value: '11', lable: 'Hip Hop', icon: 'headphones' },
    { value: '12', lable: 'Drum & Bass', icon: 'equalizer-outline' },
    { value: '13', lable: 'Electronic', icon: 'tune-vertical' },
    { value: '14', lable: 'DJ', icon: 'disc' },
    { value: '15', lable: 'Folk', icon: 'violin' },
    { value: '16', lable: 'Classical', icon: 'piano' },
    { value: '17', lable: 'Jazz', icon: 'saxophone' },
    { value: '18', lable: 'Alternative Rock', icon: 'guitar-pick-outline' },
    { value: '19', lable: 'Urban', icon: 'city-variant-outline' },
    { value: '20', lable: 'Blues', icon: 'music-clef-treble' },
    { value: '21', lable: 'Afrobeats', icon: 'earth' },
];
