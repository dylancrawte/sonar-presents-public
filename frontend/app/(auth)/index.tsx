import { Image, Pressable, View, useWindowDimensions } from "react-native";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import * as React from "react";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { ClerkAPIError } from "@clerk/types";
import { uniqueSignInErrorLines } from "@/utils/clerk-sign-in-errors";

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()
    const { width } = useWindowDimensions();

    const [emailAddress, setEmailAddress] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')
    const [isSigningIn, setIsSigningIn] = React.useState(false)
    const [errors, setErrors] = React.useState<ClerkAPIError[]>([])
    const [passwordVisible, setPasswordVisible] = React.useState(false)

    const signInErrorLines = uniqueSignInErrorLines(errors)
    const logoWidth = Math.min(width - 32, 180);
    const logoHeight = logoWidth;

    const handleSignIn = React.useCallback(async () => {
        if (!isLoaded) return;
        setIsSigningIn(true);
        setErrors([]);
    
        try {
          const signInAttempt = await signIn.create({
            identifier: emailAddress,
            password,
          });
    
          if (signInAttempt.status === "complete") {
            await setActive({ session: signInAttempt.createdSessionId });
            router.replace("/(index)");
          } else {
            console.error(JSON.stringify(signInAttempt, null, 2));
          }
        } catch (err) {
          if (isClerkAPIResponseError(err)) setErrors(err.errors);
          console.error(JSON.stringify(err, null, 2));
        } finally {
          setIsSigningIn(false);
        }
      }, [isLoaded, signIn, emailAddress, password, setActive, router]);


    return (
    <BodyScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
            padding: 16,
        }}
    >
      <View style={{ alignItems: "center", marginBottom: 16, marginTop: 50 }}>
        <Image
          source={require("@/assets/images/Sonar-logo.jpg")}
          resizeMode="contain"
          style={{ width: logoWidth, height: logoHeight, borderRadius: 12 }}
        />
      </View>
        
        <TextInput 
            label="Email" 
            value={emailAddress}
            placeholder="Enter your email" 
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(t) => {
              setErrors([]);
              setEmailAddress(t);
            }}
        />
        <View>
            <TextInput 
                label="Password" 
                value={password}
                placeholder="Enter your password"
                secureTextEntry={!passwordVisible}
                onChangeText={(t) => {
                  setErrors([]);
                  setPassword(t);
                }}
            />
            <Pressable
                onPress={() => setPasswordVisible((v) => !v)}
                hitSlop={8}
                style={{ position: "absolute", right: 14, top: 35 }}
            >
                <Ionicons
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                />
            </Pressable>
        </View>
        {signInErrorLines.map((line, i) => (
          <ThemedText
            key={`${line}-${i}`}
            style={{ color: "#DC2626", marginTop: i === 0 ? 6 : 4 }}
          >
            {line}
          </ThemedText>
        ))}
        <Button
            disabled = {!emailAddress || !password || isSigningIn}
            onPress={handleSignIn}
            loading={isSigningIn}
            style={{marginTop: 10}}
        >Sign In</Button>

        
        <View style={{
            marginTop: 16,
            alignItems: 'center',
        }}>
            <ThemedText>{`Don't have an account?`}</ThemedText>
            <Button 
            onPress={() => router.push('/sign-up')}
            variant="ghost"
            >Sign Up</Button>
        </View>

        <View style={{
            marginTop: 16,
            alignItems: 'center',
        }}>
            <ThemedText>Forgot your password?</ThemedText>
            <Button 
            onPress={() => router.push('/reset-password')}
            variant="ghost"
            >Reset Password</Button>
        </View>



    </BodyScrollView>
    )
}
