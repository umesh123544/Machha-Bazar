// Sends the signup email-verification code.
//
// Two providers are supported — pick whichever env vars you set:
//  1) Gmail SMTP (free, no domain needed) — set GMAIL_USER + GMAIL_APP_PASSWORD.
//  2) Resend (needs a verified domain to email real customers) — set RESEND_API_KEY.
//
// If GMAIL_USER is set, Gmail is used. Otherwise it falls back to Resend.
// See .env.example for setup instructions for each.

import nodemailer from "nodemailer";

const RESEND_API_URL = "https://api.resend.com/emails";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://macchabazar.com";

// Embedded as base64 (not a link to SITE_URL) so the logo always shows up in
// every email, regardless of whether the site's domain/env var is set up
// correctly, and regardless of the current deployment URL.
const LOGO_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAcMklEQVR42u2de5Bcd3XnP+f3u93TPT2jkWzrZVuSbdnYDti8LL/BYGwKCFtF1VpJKkuoPP4JlSfLkiy1ywqTLVIbSCphYStVC7ubgEOCSDYsELO8CQ/b+IENtsBGli1jWbZljaR59ev+ztk/fre7b8/0c2Rbo8q2akbTfW/fxznn9/19z+t3hZFfexzcaoAB3LThppnaer8raPoaJ/JqM7tYsU1AGazQ6wiW+40Bkv1phnS2rPgGPbcBZuPsjWH9NrW29r7q7FrVaIpRFZFnzXgYsXu8+e/MVkt3Hzj21RPZF1z2v44iVRlln93sdnvZGwCu2fnGayXoLxu8SWCHE5eYKYplAul9IzZIMNZv2+gK6KeKrl2lnwIGCL9bB/G3gGTvlJBiHAS+ZCZ/c/9Td3wPYDe7/V72KgNUPlQBe9jjbuVWBXjN+TdeqebeZ8JbvXiCBVQVsJBdlYAJ4wjfWrfey/6XCTc3YsYR/GDLH2QWnfP0VqeZgQniEcGJQzUgyOdV+KP7n7zj7hxy6NgKyDQYbthxQyn1xfeh9m5xbiLV1DCCgLco9cHWvXxbFwJZH9iRbqvsI/yThR3rK/qOyZv1H5W545hBEMw7ScRUayL86dHk8H8+ePBgDfBA6HUmP0j41+y44RJzxX9wzv1yME1UQxARJ4KzLuVZT12uuEEbbq09t0pOKCMfoZfwRvn2cHPq8U4EHIioaQCKzvnXlrRy48bpHd99dv5nR3az2+9jnw0dAS3hX7/95uvw8hmEs1NNU4nKkpWWYbzYsHNylr9q2Bl8/mWbFQuJ84kZh1TtFx84fOd3W7Ltq4DWDldfcPN1ifFPCuui1XdGitkomPsvAXaWfa/H54YFJ86DO2Ha+PkHDt+7QgkuP+HuZW947Y6bLvXw9wrr1IYJvx/sWF/YMUakgW3YsfFhx1YPO8OEb9179zmWZbcgPkKSzogr/P1Lt1x1aRT+HrdcAQJw+eabK6njk4JsVkuDIL73ddvoHETy4pXhQrHRNvWZDAcKZaBebBzMt57fs563H5UgsDlxfPLyzZdX8pJpWbf/Ft/SnZt2ftC75JZUm6ngkt54uTrYoS/sMCbssArYYTjsjPGtPrfa9zuCOLWQepecqyTFZxdu+3Ime3N74nAI115w0xWC/W4amiFOuLZGYWelua4l2Fl5f9Ya/T5oGrzwuy/bsusKIOxhj2tjEcp/EnHFTCRyOsCOZWGMtQY7/Xwuw0AoerE9XaK65vw37BJz3zMLDonzwtpiO33etX5JL8W9eGxn4OheeQ4VERW1a+9/+p67HYAo7/DOJSYxgLQ2YaeH8MUYTBJOJez0vXt14pPgeAeAvHzHDesrLrkP5Hwzjbe1ZpysfsJfjRf7vDlZQ86ybHT3oAoiIhgHCjV9VTJNcrUi56kp2PLwwmrZjj1PbKcf7JwE27HRvzUu2+kPO10fipmaiJzfrLhrXBB7rRMnmOlpBTucLrBjK8zWQAUvluoNTkxeZWZrnu20f9kaZzuj+SICCiKvSBB2RuMXWduwY6ct7NhKuxUzQ8wuTMxsYwYJ0mvyHBZSHh92WB3s2JiBtb56Gy+wN9JkO5i89tom2QA7y5lZeaz80pqBnQHZpDUJO7bsPIbAZIJQ7EXr1j7s2GkEO8veSduWi8lIg+v/w85Jws6yDdKxyWSkU8voTtZKy38+YUdW4QSsxsl6PmFn2emk20qS0x52WufIwY5kdEKke1QEO/Ww0/Wx5BRwOsNO6+Vd/KSZQpoaqRpmoAqFRCiXWtHTUwQ7ttKyk75fPB1gJ7tOJ1Ho83XDOzhzRthylmPjemGyLEyV4PBR5Y4fBQrJyvzBCw47A0Z3wunKdoiCDwonFo2zNghvuLLA1ZcnXLzdsX4aConhxfDe+Pf/tUEIkXbYKYGd3udIpC97WNuw452wWFOKifBv3jzB215f4JyNQlCj3jCawViqKTMV+OjeBl+5O3DWuqiwUwM7vXdJ7DSEHRE4vqBccp7n3b9S5rKdnsWacnxeEQwRUI3Cv+vBwN6vBc5c1z0Jn0rYWQlBpxHsCNBowut3FXnPO8pMl43ZuYCTiP+tqs3Ew4kF5WN7m7QTrzZGPP8FhB3LDRHXbXCnNqQ8DHYESBWmK8Lv/FKJs2bg+EIUfDuUKKBmTE3CbV8KHHwaKiXBLB9uPPmQ8sDwhw3apduwXffNn9rYzjAoUItUc6lq/MGfL3LXgymbNggihqpimhKaTUqFlDsfqPPp22s4UuYXAo2GkqohYngveC84J7G6+PmI7awY3aOBnD9n5rz3S9/TrYGQchv3BecFM6GZKoeebvJ/vlllYVG57KKEQiHBJ0VccZLSZJlv3D8BSYnztpVZv65AUnCoGdWqsrgUqNYCIYBzkCSCtIaHrRJ2ZPDdWJ/5U67afoMNCJv2/vxFZjtqUK2l1OuBUsmz7ZwKP3fxei6+cIbNm6bYdfkkM1NFFIc4wdTwiVFwRgiBtJmyVEuZn2vwzHM1Dh2u8uP98/x4/wL7H19i9ngTEZgseZJE0MyBGyiDnuGFftLob2JyZaaAgVSrh+VbzvNUXY3l9y9ewcD5eKqFhQYiwkUXznDj9WdzzVWbuXjnDOvXF6IjoEp1SQkhxJpk0/i/atZCYYhEduS9kjjwPu5TraYcerrKAw/N8fU7Z7n7gXlmj6dMlh2lopAGG43tsJoQCpjYcgWMVrfTEv6JBcUJVCYdzpGznPzuY0y42UTpPCwspIjAddds4RfetpNrdm2iMl3EmkatnpKm2g4ruHZ5SuwIikqwboWYYRowVVQDZooTpZgYE0UIaeCxJxb54jdm+dzXjvLk4QbTUx7vom/RV9yruMcuYrFSAYNhRwQaTWPr5oRffNM6vnbXEj96uEa1plTKjkJBCMEG9mT1gx3nIARjYaHBFa/axG/++ku5/pqtOBGWllJCiGUbLou2darisvNZAMv6VUwBxbLPOsqIwkfjNlVFQ4pgTBSMUtF46pkaf/P5I/ztF2dZqipTFU9oeXAnCzvWTXn8OTPnvX9cJ6tQEJ45Erjp2ine93ubuOLSEuUJ4fGnmsweT0kSR5IYpjKak2WG945aPeAEfv+3Xs4H3nsl5++YYWkxpd5QnAjOOcRFzmkISMY/s8a5FcduC0l6Vk5LZlFOovPWDLBUS5ksCa+7apqrX15m/8E6B56sUy65kWFnMKfoNr+cAsZjO87DvQ9WuXlXhUt3TnDDrgpvuGaKybJj/xMNZo8HyhOCuM4h+vk2PnEsLDXZvLHMf/vwa/n5f7WT2kIUfKSLDsQhmcCtxR3Fta9TyP1tHSiVdvmi5QZy9ltTCFXUQDXFWRURQU1YXGyyZWPCW183zfxC4N6HqpSKkRCMxXboP1IyBex4/4pa3BFiO8VEOHYi4Lxw/asnOXYicMaM5zW7JrnxyknqDWXfgQaNJkwUpW8Y2HtYrAa2nV3hEx99PZdccgbzs3W8dzjnMByS/YsAJAhRGVEPrVHQz+psWQljNvlrEymUKZ17MzMXvpXKuTdQsxmk/hTWXMJ7T70RUDPeeF2FNDW++4Mq5QnpWZhnQ0dEb+DNRoCNHdtRizH2x55s8IarpzhjxlNrKLWqsmHacfN1FV5x6QSPPtHg8UMppZJbEV0SgWaqTFcK/PeP3MAF561j/kSDJMnBTCb8jmVkHbHiuoSfb/W2Lr/TspGQQZCAaUB8gcpLfpWJrdfzs6fm+P3f/jBVt4PLrr4JPX4/ltZxGaWtVlNet6vEsROBux+qM1mSIQ2Ag2FnmSdsq3ayCgXh2WMpX/zWPBOljH87o95Ujp1IueLnJvjEBzbxa2+bYmFJaQYjVxCPCNRqgf/w7ldy0cUbmJ+rR+HnWVEf6zFaUCT9YwJmPZwrwUKViU1Xk6y7AMIcH/yPf8pn9/4DoXaUv/r0DzjOpSQ+RJFkuj6xEHjXO2Z45SVFFpe06z56dubYaME4Z515avzYjhoTRcdX71hgYT5kwbBoi94b84sBVeMPf2M9f/KuDZQmHEu1GChzDubnm9z0urN5y5u2s3CsRpJIZC5t+GsxmhwFzrh9ZDyhTT0hUk9rsyLLhWY6n0dI8iTT20CbII7Zoyc4c92Z/JcPfIy//Iv/QWXjJZhFgzJTRIi5hILw2780jeua14bDjg0IHDmsvxc9rEooKJSK8NiTTX58oE5pIgbCYh7Q2r7B7PHAm19T5uN7zmD7Zs/couI9eC+8fffOToqqzSozLp8JtiPUPLVU0KgE08wJy5QQZ8pMKa0lG/LH1BB/stfvvOfXOWfbVipTFd793t9ky9YzadRrke5mh3EuGtSrX1rkqssnWKhGH2g1sNM1Atr9UWPGdlqTqnewVFMeeLhKIclk0g7pKmQZqdnjgZ3bEv7yfRu45PwCzzzX5NKXzHD5S8+gttiIN2PLnaiMz1vIhJ7/ScFSzNL4XnMjoq0c63D+1qjIjtmYfQhJJrD6EtffuIt/+ub/5Mvf/hS/9s53MP+zO+OMYh1FSmYAiTNu3FWM+uuLfsPXvWj9OGy1IeVuh+LxQ01Uc1BgmeVqFGziYW4xcOaM8NH3zrB9i3D22dNMTnvSEDJL1+7Ls5AJraMU2qGG6NV2BB9iTEQDcVUA7XzW+tsMLEV8ifqz91J/6p+RiRloOmbO2sLm7Rey9PgXqB7+HlIoReVmgjcznECjqbxkh6MymfOQbRTY6ZcTljHLM5Z7uBbxfPZ4DA90XYK1GFN8nzhYqiozU8JH/mAdPz1aITSjdXUy5XlWk+cHucisWZv1iMXjSxtqQjZCW8qwqChrKSIzDBEWfvp31I8+RHH9RZgp9dl9NI7ch4hrj5T2KMi+lwZl/ZRQKQnz1XhPnSj7iM0pXQqw0X066+dRSSvXmmG1tiZMzV2dtS/SjAw/rR2ryS8JYyvGtutuX2hDZidqaXQEJqY5zNfO/KCdcES8CE/jyD3Un74TtRA9DT+BaZrNK9YeRdae6DUb3f1Yvg33EHI5Yzc4tZM7vPUvC1GFDescXqwLN9tWkQk3DUppAuYWld/70DzfvGuexOeFojmFdIJoaNqeB8xC9GAz2DELcbtmk7Eumy80ZMIPy46b7e8nkEIZV5hEfKk9oXcZB7G4yEKk2cfmlKWq4aVlV6tc+MOMZCRfYgifNYMLzk1iys9sWfYrKiJNlelJOHJc+bcfnufAIWX9hnkWT9Tx0vGULfN56dctlV8ryHJ8P1N4W8DkA3Ar55NOkK7DqMxyDGuZQVj2U/DGIwdTFmrG+oqQ6hjC7xGScDYE980GVSkYQY3yBFz+kiKN1Lom0XjD0AzKhnXCo4cC7/zgHPsONNl8ZsLD+xf44b5jlMrSjud3BBXaOG5tSw/taKZpZzQYGWRoixlph2quEGaLQeXgRTOLJxc5bc0bZu3tWCBNA9+4pxmtf0gmb5jws9LE/hOHmQyYkGMEsVY3dm5PuPi8AtWaxth85hCFYDhnnDEt3P69Gn/8iUXmFpXpihAUmsH41GcPcuUr12U3Ln2SOZJbDk26S9ta80fbQWtZf473tyltjpq2lMtyphU6gie055GQBqbKxvcfanLXgymTZSHYOIuz9Uk89bf84aUbTqDWMN5wVZnpSoSZmDw3QhorE5wYf/JXi/zhny9QrRuVkpAGCGpMT3m++t0j/OPnD1L2ddI0IGgbyzvWnHbhfRvjW39r6+/O+/w+rWOR2xdNUdNIGNojozOvGCE6dNloc6LU6oGPfaaOatdSYcMt3/rPtEl/tiND63OaKWw8w/OW15Sp1uIh09QoTUBpEu76UYO/uG2B+x8JrJ+OSk21e2IvFhx/9vHHuXiHZ8f2dTRCkULRt5lUFwHomtQ7VNeW4X98aVuA+VGQT9B0RkQeekJutMT3qsr6ivJHH6/zwCPK+mlIg60Odpa9S8aFnXZKMit8uuWNU2zfkvDc8ZRKCcol4dGfNflfn1vii9+uEQJsWBdjKdZjlBULwuyc8sGPHeAD7zqfs86cpFr3TExOZJUKLTjJ2U2eeViL9ubDFeQmzpYyNEdLLTfZdhTVnncy5aQhpi3XTykf+dsan/lqk5kpSMPqYceW8VC5Ytv1toJVDKvnEmimxmRJuO2PN3LuZgcYjx1K+d9fX+JzX6/y3AllpiJtmrrSHWnXQSJOaDYDV14qvPPt27nw/GmqDaU4MUFhotBhV2pdgbpO8I1uh8lyS2haxwmzbJHHrjxxjg3lGU/aVCplJU0Df/apGn/3lZTpSr4AYTzLtz7Fo20FDIOdrjSag7kF5dbfWs/uN1e4874qt3+3ylfurHP0WKAyKRSSaPUDbWRZckAscOE5gVvevIkbrj6TxAv1JvhiQrFYwHnpioi2/8+vWWqW4/G5v7Xzv7UcKrUsbBH3U1XSZiBxgamS8uCBwIf+us59PwnMTC0v7F0t7HTLWa4493rrJLiHU6pWUv6cTZ5bbq7w9e9X+dFPm1Rr1hb8iuqIAWUdbfVKzHQ7Z5xZaXDlyyZ5y+vP4uILJ8Gg1jREHD7xJAWH877dAZMP3pnl41H5CGhOKRndbFVIpM2ApoGCD5SLyuFZZe9XUz77tSZLtUgmRoYdG30lCgB59bnXWf8y6v4+nhNjbjEGqCbLkoWeVyqyH+z0uo2cXVBwKeunlCsvq3DTteu4ZGeZ8oSjmRqNpkV5ulgh4ZOYnuzkZzQLV+WUogENhmpAQ0BDpKHeB0qFaDA/e1b5v3emfOE7TQ49q0xNxtEenlfYYbkCrs8UYKMJ36xNy0cqzBoAO8NW6FSDNA1UisZF5xW5+vIyL7+kzHlnJ6yrxMriNMQQRxqiUlpJFLWWr6KIGYLhxEi8kiQxgFhvGk8fVR58NPDP9zW59yeB2eNKuQwTrfIani/YoZ8Ceo2AQfVB0kc5I5zcRhlby0qFRVCFeiMKuTwB52xM2Lkt4aIdRXZsLbB1ozAzJZQnJOuKiSxNzdBMOY2msVBVZueUp44oP3k85eGDKY8+EZidi1mvyQkhSaKPYuOsOTom7OT7N6ICRoQdbLQszziw0/cWuz32NsQEi8KsNw3TWFhbLgnTk45ySZgqC8Viy4Kh3lSqNWOxqixWjYUlpd6M81SSxP0KGRnXELMSJxNeGL6yY7fSkpFhZ8Qkw8o9xxG+9SiqymXgskMVC0Kp2EnXqxrH51KOHs9yMtbJTbcU51xMgRYKwkQxy0URlRiUIescjw474wh/mQIGHUiGptkGFV6NCjsjHSS7/rAsVOITydZW7hP5pe3TrfjuwMcKjO1kDUwTr9grGbSyZ5f7/7zAzhBbMUbOJPVYrJnhqXDro/PVwA7jw06vlOSwDvRTBTujCt9GgIPBbUkvPuzQPxa0lmBnyC2N2OY0eIHBUwM7XQroGXpb67Czog/39IKd/Pm7+4RfJNjhJGGnOydz+sFOn3D0iwU7w+9paE/WaQw7tpIFPb+wM7g9f7gVvSDCXxOw0/vsSTu2sxrYWfY0o8izFWmt/5dzhPLLy7ejxNLJLQvDn/d0Ml32awl2RmBBo8byOnUx3guJFxKf4JPYBO2ku3eidautqGkIRjM10lQJWTCNZYstjTr2W8fuVFpaLK5l7cFOtwJk9bEdAyYmHJNlF5sZLAoxTY1GqqjGssF8skckKsZ5wTsolxzO+ZgvTpV6U2k2NaYwbTC2ZSsxt8XoJIYbJgoOcbBUDUMnrVMBO92OmNEECqtlOyJGvaHUG9rujmzLTayrkLer5j+TZ6sBopA4igVhsuRwkx7VWHOUpvF/DTFfbZ3ns8TvekiypQe8y1qHDWp1hSHLL5wq2MmN10YCLCEy0+sxFMPYjohRrVl7IYz8T3tXWTZ4yMGSdOL+9YZSqysikoMzwfuonNiRsnIUKEYIcfRUm9bODeTrT8cEkxcYdvIGLNVEkCPATKuzdywny7oFPiikPGjASjZaRGJyP4Ro+a2R0k505c6l1nnEirWTL3GjQzAZXEppeTHlBCmdtsuxFTbGhG8iIqIcSYD9AhcqZq21Q05dbMe6Rkiv5sflpZgdA5C+dFNbFC1bX857yfqOc0rNCsrMYrO4mmW57dY1SffIXg3sdIlARMT2J8HsvkTcm9ZKbMeEEZrbbOSorROYKMYO/iSJZEGWlThaLrQRKbO0k/ppUJpNy+a4mOoU6VctuzJsbmYrYbl9m/qDxDn/bY0RcneqYzuDcLVvilN6C98sdnGuX1dAzUibRr2u2RyhmS/SY3UsAefihJ4kcR4qlzyVskezbFyzqTTTFumwHg17cQ2jxAvFgqcymbBYTVlcCi1FOEPViftm4orVO7ReeEzEXdB6hMmLHVIe5mT1XO0211Lb8wFqEqHk+IkmzaBZ4YC1Mb7lZyxDr8xPiRN7vdGBRO+FYiEytcqkR/BZP6C1c8iWHd+5uMyOcxLXKKoF6nVtCV8FcaZ6ILXGnf7wscP1Leu2XZg4f1VQDZI9Rem0gJ0RSsSDWqe3W6Snk9dPgRH3JSsMiJZfrSvVqlJvBNI05zxm3S5GzC03GspCNWUhW+tC27ZpwYlzanbb/tlH/jF6wtL8ZFB7J/QS/hqEnSH8e0W0FU46gd6q0GgdLgSy5sI+RW25eWIZmXBq2lT0rwHcHva4+5+8527DbvfOOzMLo8OOLaNsY8KOjOFhdvXwDXpsSY+nwLwAThZiuYS/LPuJk3+Pp/AEL84ZdvuBow/f0/UkvaDcamaN1h3awIXnlgnFxoQdG3VdzZVPXhklZzGoM30sJ8vGj+20mxGt5wMXMaNuJB9YPkA9EF659eoPOe//XVMbqSDJYFfihQkpD4WdcdLuz0PdzrhOVr+cg2GpF58E0w/vf27fe1oyd22Pnj2uns7dGizcm7gkMSycjrBzymI71kv4bQczOHGJovdM+uT92Vyr0GlTNYB9R/YteJW3m/K0E+e7lXCqYUfWKOzYECJoQUS8GU83NP2VHz7zw8X8KXN9wrfqbnb7ew/f8RO1xi0gcy0l9E+/2vCY+ohsp9/DIwZnswY0X/X9yBiviNZWnckzCIh4jDkJ3HLw6CM/2c1uT3sFkR4TdeuZ55dvvep65+QzAluDpikivtsMxyiaGtfJGmnC7aGWVVQpD4edVVm+GRq8+MTgMNgvPHJk33dgtyf3PPnW5Nv12sc+281u/42FLx/cPLn1Syayy7tkm6FiZmlcBe4FdrJGhJ2xcP0FCimvDHZrGh3nxJnxfVX71z89uu/eXsLvqYCWEmC3f2bxK8+4qS23TSGC2RVOkokYjrIQox3IC8d2xlyTcOznz59cJmv5lRsWBMRL4oEqIh+af272N56oPvZUlPO+0OsYvv/h99ke9rgvLHy68fT8oa+fM73tSypsBi5OXOKtzWfiHCF5+x1hLeW+sMNw2FlpweONCobCzkC2k1+CXIlNOuLFOxMw9POK/er+5/Z9aoGFZp7x9PTnRlC07Ga325sNn1dsvOLakPB24E0isl1EfKuN1PJUcZzqhZE6FEZbtbZfM9yosDOQ6lonxtBZPkeDKU844fZUwm2PHnn4e9ls6mGvMrzYY+RXzmeAy2Yu2+Amy7sC+lonvMxMdhq6CWMGmBg89K2vRY5fPjJeW9DgB0IPxf26wQngWYc8Giz8KHH+20uN+bufOPHEsV5yGvb6f8TLWZw0ehivAAAAAElFTkSuQmCC";

/** Shared header (logo) + footer (website link) wrapper for every outgoing email. */
function emailShell(bodyHtml: string) {
  return `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background:#FAF6EF;">
      <div style="text-align:center; margin-bottom: 20px;">
        <img src="data:image/png;base64,${LOGO_BASE64}" width="56" height="56" alt="Maccha Bazar" style="width:56px; height:56px; border-radius:14px; display:inline-block;" />
        <div style="font-size: 15px; font-weight: 700; color:#4a1d3d; margin-top: 8px; letter-spacing: 0.3px;">Maccha Bazar</div>
      </div>
      <div style="background:#ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        ${bodyHtml}
      </div>
      <div style="text-align:center; margin-top: 20px;">
        <a href="${SITE_URL}" style="color:#8a3b63; font-size: 12px; text-decoration: none; font-weight: 500;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
        <p style="color:#b3aaad; font-size: 11px; margin-top: 6px;">© ${new Date().getFullYear()} Maccha Bazar. All rights reserved.</p>
      </div>
    </div>
  `;
}

function buildHtml(code: string, name?: string) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return emailShell(`
      <h2 style="color:#4a1d3d; margin-bottom: 8px; margin-top: 0;">Verify your email</h2>
      <p style="color:#555; font-size: 14px;">${greeting}</p>
      <p style="color:#555; font-size: 14px;">Use this code to verify your Maccha Bazar account. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color:#4a1d3d; background:#f7f0f3; padding: 16px 0; text-align:center; border-radius: 12px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color:#999; font-size: 12px; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

function buildResetHtml(code: string, name?: string) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return emailShell(`
      <h2 style="color:#4a1d3d; margin-bottom: 8px; margin-top: 0;">Reset your password</h2>
      <p style="color:#555; font-size: 14px;">${greeting}</p>
      <p style="color:#555; font-size: 14px;">Use this code to reset your Maccha Bazar account password. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color:#4a1d3d; background:#f7f0f3; padding: 16px 0; text-align:center; border-radius: 12px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color:#999; font-size: 12px; margin-bottom: 0;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
  `);
}

async function sendViaGmail(to: string, subject: string, html: string) {
  const user = process.env.GMAIL_USER as string;
  const pass = process.env.GMAIL_APP_PASSWORD as string;
  const fromName = process.env.GMAIL_FROM_NAME || "Maccha Bazar";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: `${fromName} <${user}>`,
    to,
    subject,
    html
  });
}

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY as string;
  const from = process.env.RESEND_FROM_EMAIL || "Maccha Bazar <onboarding@resend.dev>";
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Resend email failed:", res.status, errText);
    throw new Error("Could not send email.");
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const hasGmail = !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
  const hasResend = !!process.env.RESEND_API_KEY;

  if (hasGmail) {
    await sendViaGmail(to, subject, html);
    return { skipped: false };
  }
  if (hasResend) {
    await sendViaResend(to, subject, html);
    return { skipped: false };
  }
  console.warn(
    `[email] No email provider configured (GMAIL_USER or RESEND_API_KEY). Subject "${subject}" to ${to} was not sent.`
  );
  return { skipped: true };
}

export async function sendVerificationEmail(to: string, code: string, name?: string) {
  return sendEmail(to, `${code} is your Maccha Bazar verification code`, buildHtml(code, name));
}

export async function sendPasswordResetEmail(to: string, code: string, name?: string) {
  return sendEmail(to, `${code} is your Maccha Bazar password reset code`, buildResetHtml(code, name));
}
