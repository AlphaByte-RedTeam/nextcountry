import { NextRequest, NextResponse } from "next/server"
import NextSupabase from "@/app/supabase/setup"

interface Props {
  offset: number
  limit: number
}

const MAX_OFFSET_LIMIT = 241

function isValidOffsetAndLimit({ offset, limit }: Props) {
  return (
    typeof offset === "number" &&
    typeof limit === "number" &&
    offset >= 0 &&
    limit >= 0 &&
    offset <= MAX_OFFSET_LIMIT &&
    limit <= MAX_OFFSET_LIMIT
  )
}

function generateURLWithOffsetAndLimit({ offset, limit }: Props) {
  return `/api/v1/countries?offset=${offset}&limit=${limit}`
}

export async function GET(request: NextRequest) {
  try {
    const totalCountry = MAX_OFFSET_LIMIT
    const { searchParams } = new URL(request.url)

    console.log(searchParams)

    let limit = Number(searchParams.get("limit")) || 20
    let offset = Number(searchParams.get("offset")) || 0

    const nextOffset = offset + limit
    const previousOffset = offset - limit

    const from = Math.min(limit, offset)
    const to = Math.max(limit, nextOffset)

    const isValidRequest = isValidOffsetAndLimit({ offset, limit })
    const next =
      isValidRequest && nextOffset <= MAX_OFFSET_LIMIT
        ? generateURLWithOffsetAndLimit({ offset: nextOffset, limit })
        : null
    const previous =
      isValidRequest && offset >= limit
        ? generateURLWithOffsetAndLimit({
            offset: previousOffset,
            limit,
          })
        : null

    const { data, error } = await NextSupabase.from("country")
      .select("*")
      .range(from, to - 1)
    const length = data?.length

    if (error) {
      console.error("Supabase error:", error.message)
      return NextResponse.json({
        error: "An error occurred while fetching data",
      })
    }

    if (!data) {
      console.error("No data found in Supabase")
      return NextResponse.json({
        error: "No data available",
      })
    }

    return NextResponse.json({
      totalCountry,
      length,
      next,
      previous,
      data,
    })
  } catch (err) {
    console.error("Internal server error:", err)
    return NextResponse.json({
      error: "An internal server error occurred.",
    })
  }
}
