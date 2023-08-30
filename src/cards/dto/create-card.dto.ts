import { CardType } from "@prisma/client";
import { IsNotEmpty, IsString, IsBoolean, IsIn, IsInt, IsNumberString, Length, IsDateString } from "class-validator";

export class CreateCardDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsNumberString()
    @Length(14, 16, { message: 'Card number must be among 14 and 16 numeric digits.' })
    cardNumber: string

    @IsNotEmpty()
    @IsString()
    printedName: string

    @IsNotEmpty()
    @IsString()
    securityCode: string

    @IsNotEmpty()
    @IsDateString()
    expirationDate: Date

    @IsNotEmpty()
    @IsString()
    encryptedPin: string

    @IsNotEmpty()
    @IsBoolean()
    isVirtual: boolean

    @IsNotEmpty()
    @IsIn(["CREDIT", "DEBIT", "BOTH"])
    type: CardType

    @IsNotEmpty()
    @IsInt()
    userId: number
}