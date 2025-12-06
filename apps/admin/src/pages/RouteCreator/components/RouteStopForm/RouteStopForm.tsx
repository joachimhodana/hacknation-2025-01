import {useForm} from "react-hook-form";
import {Form} from "lucide-react";
import CustomUsualInput from "@/components/shared/CustomCards/CustomInput/CustomUsualInput.tsx";

const RouteStopForm = ({setPoint}) => {
    const form = useForm()

    const onSubmit = (data: any) => {
        console.log(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-8"}>
                <CustomUsualInput name={"name"} label={"Nazwa punktu"}
            </form>
        </Form>
    )
}

export default RouteStopForm