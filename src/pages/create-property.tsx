import { useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";

import { FieldValues } from "react-hook-form";

import Form from "components/common/Form";

const CreateProperty = () => {
    // const { data: user } = useGetIdentity({
    //     v3LegacyAuthProviderCompatible: true,
    // });

    const storedUserData = localStorage.getItem('user');
    const user = storedUserData ? JSON.parse(storedUserData) : null;
    // console.log(user);

//     const storedUserData = JSON.parse(localStorage.getItem('userData'));

// // Use local storage data if available
//     const { data: user } = storedUserData
//     ? { data: storedUserData }
//     : useGetIdentity({ v3LegacyAuthProviderCompatible: true });

    
    const [propertyImage, setPropertyImage] = useState({ name: "", url: "" });
    const {
        refineCore: { onFinish, formLoading },
        register,
        handleSubmit,
    } = useForm();

    const handleImageChange = (file: File) => {
        const reader = (readFile: File) =>
            new Promise<string>((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = () => resolve(fileReader.result as string);
                fileReader.readAsDataURL(readFile);
            });

        reader(file).then((result: string) =>
            setPropertyImage({ name: file?.name, url: result }),
        );
    };

    const onFinishHandler = async (data: FieldValues) => {
        if (!propertyImage.name) return alert("Please select an image");

        // console.log(data);
        // console.log(propertyImage.url);
        // console.log(user.email);

        await onFinish({
            ...data,
            photo: propertyImage.url,
            email: user.email,
        });
    };

    return (
        <Form
            type="Create"
            register={register}
            onFinish={onFinish}
            formLoading={formLoading}
            handleSubmit={handleSubmit}
            handleImageChange={handleImageChange}
            onFinishHandler={onFinishHandler}
            propertyImage={propertyImage}
        />
    );
};
export default CreateProperty;